/**
 * 角色信息相关接口
 */
const express = require("express");

const router = express.Router();

const db = require("../models/db");
const { cdCompare, verifyToken } = require("../util/util");

let Role = db.Role;
let Menus = db.Menus;
let UsersRoles = db.UsersRoles;
let Permission = db.Permission;
let RoleMenu = db.RoleMenu;
let RolePermission = db.RolePermission;

/**
 * 获取角色数据 可模糊查询
 */
router.get('/', verifyToken, (req, res) => {
  let queryTemp = req.query;
  let sortTemp = {}, size = 10, page = 0;
  // 判断是否为空对象
  if (Object.keys(queryTemp).length > 0) {
    if (queryTemp.sort) {
      // 字符串通过','转换为数组
      let tmp = queryTemp.sort.split(',');
      // 转换字符串为数字
      tmp[1] = tmp[1] >> 0;
      sortTemp[tmp[0]] = tmp[1];
    }
    if (queryTemp.size) {
      // 转换字符串为数字
      size = ~~queryTemp.size;
    }
    if (queryTemp.page) {
      page = +queryTemp.page;
    }
  }
  // 搜索条件，'i'表示不区分大小写
  const nameReg = new RegExp(queryTemp.name, 'i');
  /**
   * $or 模糊查询 可多条件 满足一个即可
   * sort 根据如{id : 1} 进行正序排序，倒序排序为-1
   * skip 跳过多少条数据
   * limit 返回的条数
   */
  Role.find(
    {    
      $or: [{ name: { $regex: nameReg } }]
    })
    .sort(sortTemp)
    .skip(page * size)
    .limit(size)
    .then(role => {
      /**
       * 返回数据总数、保证模糊查询时返回对应数据的条数
       */
      Role.find({ $or: [{ name: { $regex: nameReg } }] }).count()
        .then(co => {
          return res.json({ status: 200, info: '查询成功', content: role, totalElements: co });
        })
        .catch(err => {
          return res.json({ status: -1, info: `查询失败：${err.name} : ${err.message}` });
        });
    })
    .catch(err => {
      return res.json({ status: -1, info: `查询角色失败：${err.name} : ${err.message}` });
    });
})

/**
 * 获取role的id值查询对应的菜单和权限数据
 * 请求示例：http://localhost:3000/role/1
 */
router.get('/:id', verifyToken, (req, res) => {
  let tempId = req.params.id;
  if (!tempId) {
    return res.json({ status: -1, info: `查询ID不能为空` })
  }
  // 转换字符串为数字
  tempId = +tempId;
  // getSupMenuAndPerm(tempId, res);

  // 根据role_id进行分组，将menu_id的数据存储为数组menuList属性中
  RoleMenu.aggregate([{ $group: { _id: '$role_id', menuList: { $addToSet: '$menu_id' } } }])
    .then(meCh => {
      let menus = getList(tempId, meCh);
      RolePermission.aggregate([{ $group: { _id: '$role_id', permList: { $addToSet: '$permission_id' } } }])
        .then(peCh => {
          let perms = getList(tempId, peCh);
          let endData = [{ menus, perms }]
          return res.json({ status: 200, info: '获取成功', data: endData })
        })
        .catch(err => {
          return res.json({ status: -1, info: `查询权限失败：${err.name} : ${err.message}` });
        });
    })
    .catch(err => {
      return res.json({ status: -1, info: `查询菜单失败：${err.name} : ${err.message}` });
    });
})

/**
 * 增加一条角色数据
 */
router.post('/', verifyToken, (req, res) => {
  let roleData = req.body;
  // 转换'1'为数字1
  roleData.level = ~~roleData.level;
  // 根据id进行倒序排序，获取1条数据
  Role.find({}).sort({ id: -1 }).limit(1)
    .then(maxData => {
      // 手动设置当前id值为，最大id加1
      roleData.id = maxData[0].id + 1;
      roleData.level = maxData[0].level + 1;
      Role.create(roleData)
        .then(role => {
          return res.json({ status: 200, info: `创建成功`, role })
        })
        .catch(err => {
          return res.json({ status: -1, info: `创建角色失败：${err.name} : ${err.message}` });
        })
    })
    .catch(err => {
      return res.json({ status: -1, info: `查询角色ID最大值失败：${err.name} : ${err.message}` });
    })

})

/**
 * 修改一条角色数据
 */
router.put('/:id', verifyToken, (req, res) => {
  let roleData = req.body;
  let roleId = req.params.id;
  roleData.update_time = new Date();
  // console.table(roleData);
  // console.log(roleData);
  Role.updateOne({ id: roleId }, roleData)
    .then(role => {
      if (1 == role.n) {
        return res.json({ status: 200, info: '更新成功' });
      } else {
        return res.json({ status: -1, info: `更新角色${roleId}值不存在：${role}` });
      }
    })
    .catch(err => {
      return res.json({ status: -1, info: `更新角色失败：${err.name} : ${err.message}` });
    })

})

/**
 * 修改role_menu对应的菜单
 * [思路] -- 直接删除对应id的数据，然后增加添加的数据
 */
router.put('/menus/:id', verifyToken, (req, res) => {
  let endArr = req.body;
  // 转换为数字
  let roleId = ~~req.params.id;
  // 1`删除
  RoleMenu.remove({ 'role_id': roleId })
    .then(removeMenu => {
      // 2`增加
      endArr.length && endArr.forEach((item) => {
        RoleMenu.create({ role_id: roleId, menu_id: item })
      })
      RoleMenu.find({ role_id: roleId, menu_id: endArr[0] })
        .then((roleMenus) => {
          return res.json({ status: 200, info: '更新成功' })
        })
        .catch(err => {
          return res.json({ status: -1, info: `更新role_menu失败：${err.name} : ${err.message}` });
        })
    })
    .catch(err => {
      return res.json({ status: -1, info: `删除对应role_menu失败：${err.name} : ${err.message}` });
    })

})

/**
 * 修改role_permission对应的权限
 */
router.put('/permission/:id', verifyToken, (req, res) => {
  let endArr = req.body;
  // 转换为数字
  let roleId = ~~req.params.id;
  // 1`删除
  RolePermission.remove({ 'role_id': roleId })
    .then(removePerm => {
      // 2`增加
      endArr.length && endArr.forEach((item) => {
        RolePermission.create({ role_id: roleId, permission_id: item })
      })
      RolePermission.find({ role_id: roleId, permission_id: endArr[0] })
        .then((rolePerms) => {
          return res.json({ status: 200, info: '更新成功' })
        })
        .catch(err => {
          return res.json({ status: -1, info: `更新role_permission失败：${err.name} : ${err.message}` });
        })
    })
    .catch(err => {
      return res.json({ status: -1, info: `删除对应role_permission失败：${err.name} : ${err.message}` });
    })
})

/**
 * 删除一条角色数据
 */
router.delete('/:id', verifyToken, (req, res) => {
  // 需要先删除role_menus和role_perm，然后删除role表中数据
  let roleId = req.params.id;
  RoleMenu.deleteMany({ role_id: roleId })
    .then(ur => {
      RolePermission.deleteMany({
        role_id: roleId
      })
        .then(pe => {
          Role.deleteOne({ id: roleId })
            .then(role => {
              if (1 == role.n) {
                return res.json({ status: 200, info: '删除成功', role });
              } else {
                return res.json({ status: -1, info: `删除角色${roleId}值不存在：${role}` });
              }
            })
            .catch(err => {
              return res.json({ status: -1, info: `删除角色失败：${err.name} : ${err.message}` });
            });
        })
        .catch(err => {
          return res.json({ status: -1, info: `删除角色权限失败：${err.name} : ${err.message}` })
        });
    })
    .catch(err => {
      return res.json({ status: -1, info: `删除角色菜单失败：${err.name} : ${err.message}` })
    });
})

/**
 * 根据角色id，获取菜单、权限信息 -- 和user不同，有细微改动
 * 参数user变成roleId
 * UserRoles变成Role
 */
const getSupMenuAndPerm = function (roleId, res) {
  // "$match" 表示筛选信息，"$lookup" 根据主外键联表查询（外键是相对主表中的字段名）
  UsersRoles.aggregate([
    { "$match": { "role_id": roleId } },
    {
      $lookup: {
        from: 'role_menu',
        localField: "role_id",
        foreignField: "role_id",
        as: "inventory_menu"
      }
    }, {
      $lookup: {
        from: 'menus',
        localField: "inventory_menu.menu_id",
        foreignField: "id",
        as: "menu_detail"
      }
    },
    {
      $lookup: {
        from: 'role_permission',
        localField: "role_id",
        foreignField: "role_id",
        as: "inventory_permission"
      }
    }, {
      $lookup: {
        from: 'permission',
        localField: "inventory_permission.permission_id",
        foreignField: "id",
        as: "permission_detail"
      }
    }
  ])
    .then(supData => {
      getSignData(res, supData, roleId);
    })
    .catch(err => {
      return res.json({ status: -1, info: `获取父级菜单失败0${err}` });
    })
}

/**
 * 获取用户单独信息
 * 1'创建临时表
 * 2'获取数据
 * 3'查询只有父元素数据
 * 4'删除临时表
 */
const getSignData = function (res, supData, roleId) {
  /**
   * "$unwind" 表示将文档中的某一个数组类型字段拆分成多条，每条包含数组中的一个值
   * $group 根据_id进行分组（_id重新赋值为children对象中的id）， $push 将"$children"结果插入到数组menu字段中
   * $sort 根据_id进行正序排序
   * $out 将结果插入到名为temp_menu的临时表中
   */
  Menus.aggregate([
    {
      "$unwind": "$children"
    },
    { $group: { _id: "$children.id", menu: { $push: "$children" } } },
    { $sort: { _id: 1 } },
    { $out: "temp_menu" }
  ])
    .then(() => {
      // 创建成功后返回一个空数组
      Permission.aggregate([
        {
          "$unwind": "$children"
        },
        { $group: { _id: "$children.id", perm: { $push: "$children" } } },
        { $sort: { _id: 1 } },
        { $out: "temp_perm" }
      ])
        .then(tmp => {
          // 菜单、权限子集
          UsersRoles.aggregate([
            { "$match": { "role_id": roleId } },
            {
              $lookup: {
                from: 'role_menu',
                localField: "role_id",
                foreignField: "role_id",
                as: "inventory_docs"
              }
            }, {
              $lookup: {
                from: 'temp_menu',
                localField: "inventory_docs.menu_id",
                foreignField: "_id",
                as: "sub_menu_detail"
              }
            }, {
              $lookup: {
                from: 'role_permission',
                localField: "role_id",
                foreignField: "role_id",
                as: "inventory_docs"
              }
            }, {
              $lookup: {
                from: 'temp_perm',
                localField: "inventory_docs.permission_id",
                foreignField: "_id",
                as: "sub_permission_detail"
              }
            }
          ])
            .then(subDa => {
              // 删除临时表 -------- 问题描述：drop is not a function
              // TempMenu.drop();
              // TempPerm.drop();

              let menuAndPerm = [], onlyIdArr = [];
              // 返回对应的菜单值和权限值
              menuAndPerm = getCorrespondData(supData, subDa);
              // 返回只有id值的菜单值和权限值
              onlyIdArr = getOnlyIdMenuAndPerm(menuAndPerm);

              return res.json({
                status: 200,
                info: '角色的菜单权限查询成功',
                data: onlyIdArr
              })
            })
            .catch(err => {
              return res.json({ status: -1, info: `临时表菜单查询失败${err}` });
            })
        })
        .catch(err => {
          return res.json({ status: -1, info: `临时表权限创建失败0${err}` });
        })
    })
    .catch(err => {
      return res.json({ status: -1, info: `临时表菜单创建失败0${err}` });
    })
}

/**
 * 获取对应的菜单和权限数据
 * @param {*} supData 所有父级元素
 * @param {*} subDa   单独子元素
 */
const getCorrespondData = function (supData, subDa) {
  let temp = [];
  let menus = supData[0].menu_detail;
  let permissions = supData[0].permission_detail;
  let tm = subDa[0].sub_menu_detail;
  let tpe = subDa[0].sub_permission_detail;
  let tempSubMenu = [];
  let tempSubPerm = [];
  tm.length && tm.forEach(im => {
    im.menu.length && tempSubMenu.push(im.menu[0]);
  })
  tpe.length && tpe.forEach(ir => {
    ir.perm.length && tempSubPerm.push(ir.perm[0]);
  })
  // 菜单值
  menus = menus.map(sp => {
    tempSubMenu.forEach(it => {
      if (sp.id == it.pid) {
        // 返回有重复元素
        sp.children.push(it);
      }
    })
    sp.children && (sp.children = sp.children.sort(cdCompare("id")));
    let u = [];
    sp.children && (u = sp.children.filter((i, index, arr) => {
      let supId = index + 1;
      // 问题描述：当前数组中，若出现重复元素，只返回重复元素，若没有重复元素，则返回全部子元素
      if (supId < arr.length) { // 注意小于
        return i.id == arr[supId]["id"];
      }
    }))
    // 解决办法：当返回的数组不为空时，表示返回的重复数据组成的新数组
    // 否则返回原来的值
    if (u.length != 0) {
      sp.children = u;
    }
    return sp;
  })
  // 通过id值进行排序
  menus.length && (menus = menus.sort(cdCompare("id")));
  // 权限值
  let q = [];
  q = permissions.concat(tempSubPerm);
  q.forEach(o => {
    if (o.children && o.children.length > 0) {
      o.children = [];
    }
  })
  q.length && (q = q.sort(cdCompare("id")));
  permissions = q;
  temp.push(menus, permissions);
  return temp;
}

/**
 * 获取对应的菜单和权限数据
 * @param {*} supData 所有父级元素
 * @param {*} subDa   单独子元素
 */
const getOnlyIdMenuAndPerm = function (obj) {
  let menus = obj[0];
  let perms = obj[1];
  let menuIdArr = [], permIdArr = [];
  menuIdArr = getIdArr(menus);
  permIdArr = getIdArr(perms);
  return [{ menus: menuIdArr, perms: permIdArr }];
}

/**
 * 获取只有所有id值的数组
 * @param {*} objArr 
 */
const getIdArr = function (objArr) {
  let arr = [];
  objArr.length && objArr.forEach((obj) => {
    obj.id && arr.push(obj.id)
    if (obj['children'] && obj['children'].length > 0) {
      let teCh = obj['children'];
      teCh.forEach(item => {
        arr.push(item.id)
      })
    }
  })
  return arr;
}

/**
 * 返回只有id的数组
 */
const getList = function (id, obj) {
  let arr = [];
  obj.length && obj.forEach(item => {
    if (item._id == id) {
      let list = Object.keys(item)[1]; // Object.keys(item)返回值, 如['_id', 'menuList']
      list && (arr = item[list]);
    }
  })
  return arr;
}

module.exports = router; // 【注意导出对象】
