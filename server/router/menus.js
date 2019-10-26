/**
 * 菜单信息相关接口
 * @type {createApplication}
 */
const express = require("express");
const router = express.Router();
const db = require("../models/db");
const { verifyToken, cdCompare, noRepeatObj } = require("../util/util");
let Menus = db.Menus;
let Users = db.Users;
let UsersRoles = db.UsersRoles;

/**
 * 获取菜单数据 可模糊查询
 */
router.get("/", verifyToken, (req, res) => {
  let queryTemp = req.query;
  let sortTemp = { id: 1 };
  let size = 10, page = 0;
  if (Object.keys(queryTemp).length > 0) { // 判断是否为空对象    
    if (queryTemp.sort) { // 根据某字段进行排序
      let tmp = queryTemp.sort.split(',');
      tmp[1] = ~~tmp[1]; // 将字符串转换为数字
      sortTemp[tmp[0]] = tmp[1];
    }
    if (queryTemp.size) { // 查询条数
      size = queryTemp.size >> 0; // 将字符串转换为数字
    }
    // 当前页数
    if (queryTemp.page) {
      page = +queryTemp.page;
    }
  }
  // 搜索条件 -- 不区分大小写
  const nameReg = new RegExp(queryTemp.name, 'i');
  /**
   * $or 多条件模糊查询，选择一个模糊查询，数组
   * sort 根据如{id : 1} 进行正序排序，倒序排序为-1
   * skip 跳过多少条数据
   * limit 返回的条数
   */
  Menus.find(
    {
      $or: [
        { name: { $regex: nameReg } }
      ]
    })
    .sort(sortTemp)
    .skip(page * size)
    .limit(size)
    .then(menu => {
      let maxId = getMenuMaxId(menu);
      Menus.find({ $or: [{ name: { $regex: nameReg } }] }).count()
        .then(count => {
          return res.json({ status: 200, info: '获取成功', content: menu, maxId, totalElements: count });
        })
        .catch(err => {
          return res.json({ status: -1, info: `菜单数据计数：${err.name} : ${err.message}` });
        })
    })
    .catch(err => {
      return res.json({ status: -1, info: `查询菜单失败：${err.name} : ${err.message}` });
    });
});

/**
 * 获取对应用户的菜单数据
 */
router.get('/user', verifyToken, (req, res) => {
  let tokenMenu = req.headers['authorization'];
  if (!tokenMenu) {
    return res.json({ status: 401, info: '未登录喔...' });
  }
  // 注意传递的值多了两个引号
  tokenMenu = tokenMenu.split(`"`)[1];
  Users.findOne({ 'token': tokenMenu })
    .then(user => {
      if (!user) {
        return res.json({ status: 401, info: '账号有误，请退出重新登录...' });
      }
      getSupMenuAndPerm(user, res);
    })
    .catch(err => {
      return res.json({ status: -1, info: `查询菜单失败：${err.name} : ${err.message}` });
    })
})

/**
 * 增加一条菜单数据
 */
router.post('/', verifyToken, (req, res) => {
  let params = req.body;
  if (!params.name) {
    return res.json({ status: -1, info: '菜单名字不能为空' });
  }
  let idArr = [3, 7, 11]; // 先目前只支持二级菜单，不支持三级菜单
  if (idArr.indexOf(params.pid) == -1) {
    return res.json({ status: -1, info: '现目前只支持用户、权限、编辑为上级目录' });
  }
  // 只能增加到当前已存在的上级目录下
  // 获取最大id值(find)   将当前数据加入到指定pid的children下(update)
  Menus.find({})
    .then(menus => {
      let maxId = getMenuMaxId(menus);
      if (!isNaN(maxId)) {  // 确定获取到菜单最大值id
        params.id = maxId + 1;
        params.label = params.name;
        params.create_time = new Date();
        params.update_time = params.create_time;
        // 更新上级目录中children字段   $ne主要拿来判断，若数组里面有这个值，则不插入；没有才插入
        // Menus.updateOne({ id: params.pid }, { $push: { children: params } })
        // Menus.updateOne({ id: params.pid, "children.name": {$ne: params.name} }, { $set: params })
        // $addToSet(结合$each使用，可以增加多个) 比 $ne更好用
        Menus.updateOne({ id: params.pid }, { $addToSet: { "children": { $each: [params] } } })
          .then(menu => {
            if (1 == menu.n) {
              return res.json({ status: 200, info: '创建成功', data: menu });
            } else {
              return res.json({ status: -1, info: '创建菜单数据有误', data: menu });
            }
          })
          .catch(err => {
            return res.json({ status: -1, info: `创建菜单失败：${err.name} : ${err.message}` });
          })
      } else {
        return res.json({ status: 200, info: `获取菜单最大值失败：${maxId}` });
      }
    })
    .catch(err => {
      return res.json({ status: -1, info: `查询菜单maxId失败：${err.name} : ${err.message}` });
    });

});

/**
 * 修改一条菜单数据
 */
router.put('/:id', verifyToken, (req, res) => {
  let menuId = req.params.id >> 0;
  let upMenu = req.body;
  if (!menuId) {
    return res.json({ status: -1, info: '修改ID值不能为空' });
  }
  if (!upMenu.id) {
    return res.json({ status: -1, info: '请求参数ID不能为空' });
  }
  let nowDate = new Date();
  upMenu.label = upMenu.name;
  upMenu.update_time = nowDate;
  // [1'] 修改当前子元素 pid不变
  // 数组元素是对象时，使用$elemMatch， 不是对象时，直接用属性去查找
  Menus.updateOne({ id: upMenu.pid, children: { $elemMatch: { id: menuId } } },
    {
      $set: {
        "children.$.id": upMenu.id,
        "children.$.name": upMenu.name,
        "children.$.label": upMenu.name,
        "children.$.svgIcon": upMenu.svgIcon,
        "children.$.path": upMenu.path,
        "children.$.components": upMenu.components,
        "children.$.iframe": upMenu.iframe,
        "children.$.pid": upMenu.pid,
        "children.$.update_time": upMenu.update_time,
      }
    })
    .then(menu => {
      /* 修改成功一条数据 */
      if (1 == menu.n) {
        return res.json({ status: 200, info: '修改成功', data: menu });
      } else {
        // [2'] 修改当前子元素 pid改变
        // 修改了pid，需要之前的pid  需要先通过$pull删除指定数组中子元素
        Menus.updateOne({ children: { $elemMatch: { id: menuId } } }, { $pull: { "children": { id: menuId } } })
          .then(delMenu => {
            // 再添加到新的pid菜单数组下
            if (1 == delMenu.n) {
              upMenu.create_time = nowDate;
              Menus.updateOne({ id: upMenu.pid }, { $addToSet: { "children": { $each: [upMenu] } } })
                .then(newMenu => {
                  return res.json({ status: 200, info: '修改成功', data: { newMenu, upMenu } });
                })
                .catch(err => {
                  return res.json({ status: -1, info: `修改菜单失败1：${err.name} : ${err.message}` });
                })
            } else {
              return res.json({ status: -1, info: `删除原菜单的ID${menuId}失败：${err.name} : ${err.message}` });
            }
          })
          .catch(err => {
            return res.json({ status: -1, info: `当前元素ID${menuId}不存在：${err.name} : ${err.message}` });
          })
      }
    })
    .catch(err => {
      return res.json({ status: -1, info: `修改菜单失败0：${err.name} : ${err.message}` });
    })

});

/**
 * 删除一条菜单数据
 */
router.delete('/:id', verifyToken, (req, res) => {
  const menuId = ~~req.params.id; // 转换为数字
  if (!menuId) {
    return res.json({ status: -1, info: '删除ID值不能为空' })
  }
  // 删除指定数据中children数组中子元素
  Menus.updateOne({ children: { $elemMatch: { id: menuId } } }, { $pull: { "children": { id: menuId } } })
    .then(menu => {
      if (1 == menu.n) {
        return res.json({ status: 200, info: '删除成功', data: menu });
      } else {
        return res.json({ status: -1, info: '删除菜单数据有误', data: menu });
      }
    })
    .catch(err => {
      return res.json({ status: -1, info: `删除菜单${menuId}失败：${err.name} : ${err.message}` });
    })

});

/**
 * 获取所有元素中最大id值
 * @param data
 * @returns {number}
 */
const getMenuMaxId = function (data) {
  let tempId = 0;   // 父元素对应的第一层最大值
  let childId = 0;  // 子元素即对应其子级组成的数组中最大值
  let arr = [];     // 子元素即对应其子级组成的数组
  tempId = getMaxId(data);
  arr = getOtherArr(data, arr);
  childId = getMaxId(arr);
  if (childId > tempId || isNaN(tempId)) {
    tempId = childId;
  }
  return ~~tempId;  // 保证返回值为数字，不为null
}

/**
 * 获取数组最大值
 * @param data
 */
const getMaxId = function (data) {
  return Math.max.apply(Math, data.map(mu => mu.id));
};

/**
 * 将所有children中的元素组成新的数组
 * 此处 Array.from函数写着玩的（作用：将其他类型数据转换为数组）
 * @param data
 * @param arr
 * @returns {Array}
 */
const getOtherArr = function (data, arr) {
  Array.from(data).forEach(item => {
    if (item.children && item.children.length > 0) {
      arr = arr.concat(item.children);
      arr = getOtherArr(item.children, arr);
    }
  })
  return arr;
};

/**
 * 获取用户菜单信息
 */
const getSupMenuAndPerm = function (user, res) {
  let tid = user.id;
  UsersRoles.aggregate([
    { "$match": { "user_id": tid } },
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
    }
  ])
    .then(supData => {
      if (supData.length == 0) {
        /* 该账号没有菜单权限 */
        return res.json({ status: -1, info: `该账户没有菜单权限喔，请联系管理员添加权限` });
      }
      getSignData(res, supData, user);
    })
    .catch(err => {
      return res.json({ status: -1, info: `获取父级菜单失败0：${err.name} : ${err.message}` });
    })
}

/**
 * 获取用户单独信息
 * 1'创建临时表
 * 2'获取数据
 * 3'查询只有父元素数据
 * 4'删除临时表
 */
const getSignData = function (res, supData, user) {
  let tid = user.id;
  Menus.aggregate([
    {
      "$unwind": "$children"
    },
    { $group: { _id: "$children.id", menu: { $push: "$children" } } },
    { $sort: { _id: 1 } },
    { $out: "temp_menu" }
  ])
    // 创建成功后返回一个空数组
    .then(() => {
      // 菜单子集
      UsersRoles.aggregate([
        { "$match": { "user_id": tid } },
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
        }
      ])
        .then(subDa => {
          // 删除临时表 -------- 问题描述：drop is not a function
          // TempMenu.drop();
          let menuUser = [];
          // 返回对应的菜单值
          menuUser = getCorrespondData(supData, subDa);

          return res.json({
            status: 200,
            info: '获取成功',
            content: menuUser
          })
        })
        .catch(err => {
          return res.json({ status: -1, info: `临时表菜单查询失败_1：${err.name} : ${err.message}` });
        })
    })
    .catch(err => {
      return res.json({ status: -1, info: `临时表菜单创建失败_0：${err.name} : ${err.message}` });
    })
}

/**
 * 获取对应的菜单和权限数据
 * @param {*} supData 所有父级元素
 * @param {*} subDa   单独子元素
 */
const getCorrespondData = function (supData, subDa) {
  let temp = [];
  let menus = [];
  let tm = [];
  let tempSubMenu = [];
  supData.length && supData.forEach(item => {
    menus = menus.concat(item.menu_detail);
  })
  subDa.length && subDa.forEach(item => {
    tm = tm.concat(item.sub_menu_detail);
  })
  tm.length && tm.forEach(im => {
    im.menu.length && tempSubMenu.push(im.menu[0]);
  })

  // 菜单值
  menus = menus.map(sp => {
    tempSubMenu.forEach(it => {
      if (sp.id == it.pid) {
        sp.children.push(it); // 返回有重复元素
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

  if (menus.length) {
    /* 通过id值进行排序 */
    menus = menus.sort(cdCompare("id"));
    /* 去重children数组 */
    menus = menus.map(item => {
      item.children = noRepeatObj(item.children, 'id');
      return item;
    })
    /* 去重菜单数组 */
    menus = noRepeatObj(menus, 'id');
  }
  temp = menus;
  return temp;
}

module.exports = router;
