/**
 * 用户信息相关接口
 * @type {createApplication}
 */
//引入express模块
const express = require("express");

//定义路由级中间件
const router = express.Router();

//引入数据模型模块
const db = require("../models/db");
const { cdCompare, generateToken, verifyToken, userEncrypt, userDecrypt, noRepeatObj } = require("../util/util");

let Users = db.Users;
let Menus = db.Menus;
let UsersRoles = db.UsersRoles;
let Permission = db.Permission;


/**
 * 查询所有用户信息、需要token验证、可模糊查询
 */
router.get("/", verifyToken, (req, res) => {
  // 获取接口参数
  let queryTemp = req.query;
  // 初始化排序变量
  let sortTemp = {}, size = 10, page = 0;
  // 判断参数传递是否为空
  if (Object.keys(queryTemp).length > 0) {
    if (queryTemp.sort) {
      // sort对应值为"id,1",mongoose中'1'表示根据id进行正序排序,反之'-1'表示倒序
      let tmp = queryTemp.sort.split(',');
      // 将字符串转换为数字，如"1" --> 1
      tmp[1] = ~~tmp[1];
      sortTemp[tmp[0]] = tmp[1];
    }
    // 查询条数
    if (queryTemp.size) {
      // 将字符串转换为数字
      size = queryTemp.size >> 0;
    }
    // 查询页数
    if (queryTemp.page) {
      // 将字符串转换为数字
      page = queryTemp.page * 1;
    }
  }
  // 搜索条件、'i'不区分大小写
  const nameReg = new RegExp(queryTemp.name, 'i');
  /**
   * $or 模糊查询 可多条件 满足一个即可
   * {token: 0} 表示查询返回值没有token字段，1表示只返回对应字段
   * sort 根据如{id : 1} 进行正序排序，倒序排序为-1
   * skip 跳过多少条数据
   * limit 限制返回条数（此分页适用于少数据）
   * 【--】大数据时，可以参考通过前端传递'_id'，然后根据'_id'倒序排序，查找'$lt'小于此'_id'的值，然后结合limit
   *      例如.find({'_id': {"$lt": id}}).sort({'_id':-1}).limit(5)
   */
  Users.find(
    {
      $or: [
        { name: { $regex: nameReg } }
      ]
    },
    {
      token: 0
    })
    .sort(sortTemp)
    .skip(page * size)
    .limit(size)
    .then(user => {
      if (user) {
        /**
         * 返回数据总数、保证模糊查询时返回对应数据的条数
         */
        Users.find({ $or: [ {name: { $regex: nameReg }} ] }).count()
          .then(co => {
            return res.json({ status: 200, info: '查询成功', content: user, totalElements: co });
          })
          .catch(err => {
            return res.json({ status: -1, info: `查询失败${err}` });
          });
      } else {
        return res.json({ status: -1, info: '查询失败' });
      }
    })
    .catch(err => {
      return res.json({ status: -1, info: `查询失败${err}` });
    });
});

// 退出登录
router.get('/logout', verifyToken, (req, res) => {

})

// 通过ObjectId查询单个用户信息路由
router.get("/:id", verifyToken, (req, res) => {
  // 接口对应的参数是localhost:8080/13
  // 【注意】转换为数字id,因为定义模型时，类型写的Number
  let id = +req.params.id;
  /**
   * 聚合(aggregate)主要用于处理数据，并返回计算后的数据结果，有点类似sql语句中的 count(*)
   * "$project" 只显示（1）或隐藏（0）对应属性
   * "$match" 用于过滤数据，只输出符合条件的文档
   * "$lookup" 根据主外键联表查询（外键是相对主表中的字段名）
   */
  Users.aggregate([
    { "$project": { "__v": 0 } },
    { "$match": { "id": id } },
    {
      $lookup: {
        from: 'users_roles',
        localField: "id",
        foreignField: "user_id",
        as: "users_roles"
      }
    }
  ])
    .then(user => {
      if (user.length == 0) {
        return res.json({ status: 200, info: '查询成功', data: {} });
      } else {
        let obj = user[0];
        if (obj.users_roles.length == 0) {
          obj.roles = [];
          delete obj['users_roles'];
        } else {
          let arr = [];
          obj.users_roles.map(i => {
            arr.push(i['role_id']);
          })
          obj.roles = arr;
          delete obj['users_roles'];
        }
        // 解密密码
        obj.password = userDecrypt(obj.password);
        return res.json({ status: 200, info: '查询成功', data: obj });
      }
    })
    .catch(err => {
      return res.json({ status: -1, info: `查询单个用户失败${err.name}: ${err.message}` });
    });

})

// 用户登录
router.post('/login', (req, res) => {
  // 获取用户信息 -- 传值时qs.stringify序列化过 -- postman测试能获取到，但浏览器获取的url的'?'后没有参数
  // let myUser = qs.parse(req.url.split('?')[1]);
  let myUser = req.body;
  let name = myUser.name && myUser.name.trim();
  let pass = myUser.pass && myUser.pass.trim(); // 注意 前端pass字段，数据库是password字段
  if (!name || name == '') {
    return res.json({ status: -1, info: '用户名不能为空' });
  }
  if (!pass || pass == '') {
    return res.json({ status: -1, info: '密码不能为空' });
  }
  /* mongoose模块查询一条数据方法 */
  Users.findOne({ name: name })
    .then(user => {
      if (!user) {
        /* 注意return */
        return res.json({ status: -1, info: '用户名错误' });
      } else if (user) {
        let dbPass = userDecrypt(user.password);
        /* 解密后的密码 与 用户输入密码进行比较 */
        if (dbPass !== pass) {
          return res.json({ status: -1, info: '密码错误' });
        } else {
          // 获取token 注意是"_id"
          Users.findOne({ id: user.id }, { password: 0 })
            .then(endUser => {
              // 获取用户权限和菜单权限
              getSupMenuAndPerm(endUser, res);
            })
            .catch(err => {
              return res.json({ status: -1, info: `用户信息查询失败${err}` })
            });
        }
      }
    })
    .catch(err => {
      return res.json({ status: -1, info: `登录失败${err}` });
    })
});

/**
 * 获取用户菜单信息
 */
const getSupMenuAndPerm = function (user, res) {
  let tid = user.id;
  // tid = 3; // ...
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
      if (supData.length == 0) {
        /* 该账号没有菜单，也没有权限 */
        return res.json({ status: -1, info: `该账户没有菜单权限喔，请联系管理员添加权限` });
      }
      getSignData(res, supData, user);
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
const getSignData = function (res, supData, user) {
  let tid = user.id;
  // tid = 3; // ...
  /**
   * 【创建菜单临时表】
   * 参考https://docs.mongodb.com/manual/reference/operator/aggregation/unwind/
   * "$unwind" 如将本是一条含children数组(包含三个元素)的数据，就返回以children为字段名，children的数据被元素替换的三条数据
   * "$group" 需要以"_id"进行分组
   * "$push" 将"children"字段下的数据，作为元素添加到menu数组中
   * "$sort" 以"_id"进行正序排序
   * "$out" 输出临时表的名字
  */
  Menus.aggregate([
    {
      "$unwind": "$children"
    },
    { $group: { _id: "$children.id", menu: { $push: "$children" } } },
    { $sort: { _id: 1 } },
    { $out: "temp_menu" }
  ])
    .then(() => { // 创建成功后返回一个空数组
      /* 创建权限临时表 */
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
              let menuAndPerm = [];
              // 返回对应的菜单值和权限值
              menuAndPerm = getCorrespondData(supData, subDa);

              let uid = user.id
              let token = generateToken({ uid })
              // 存储当前token值到user表中, { new: true } 表示返回最新的数据，默认false返回旧数据
              Users.findByIdAndUpdate(user._id, { $set: { "token": token } }, { new: true })
                .then(upUs => {
                  let userInfo = upUs;
                  userInfo.password = undefined;
                  return res.json({
                    status: 200,
                    info: '登录成功',
                    data: { userInfo, menuAndPerm }
                  })
                })
                .catch(err => {
                  return res.json({ status: -1, info: `token存储失败：${err.name} : ${err.message}` });
                })
            })
            .catch(err => {
              return res.json({ status: -1, info: `临时表菜单查询失败_1: ${err.name} : ${err.message}` });
            })
        })
        .catch(err => {
          return res.json({ status: -1, info: `临时表权限创建失败_0: ${err.name} : ${err.message}` });
        })
    })
    .catch(err => {
      return res.json({ status: -1, info: `临时表菜单创建失败_0: ${err.name} : ${err.message}` });
    })
};

/**
 * 获取对应的菜单和权限数据
 * @param {*} supData 所有父级元素
 * @param {*} subDa   单独子元素
 */
const getCorrespondData = function (supData, subDa) {
  let temp = [];
  let menus = [];
  let permissions = [];
  let tm = [];
  let tpe = [];
  let tempSubMenu = [];
  let tempSubPerm = [];
  /**
   *【问题】 用户添加的多个角色，只返回第一个角色对应的菜单和权限
   *【思路】 将多个角色对应的菜单数组去重后返回，同理权限也一样
   * 父元素数据 
  */
  supData.length && supData.forEach(item => {
    menus = menus.concat(item.menu_detail);
    permissions = permissions.concat(item.permission_detail);
  })
  /* 子元素数据 */
  subDa.length && subDa.forEach(item => {
    tm = tm.concat(item.sub_menu_detail);
    tpe = tpe.concat(item.sub_permission_detail);
  })
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
  if(menus.length) {
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

  // 权限值
  permissions = permissions.concat(tempSubPerm);
  permissions.forEach(o => {
    if (o.children && o.children.length > 0) {
      /* 将children子元素清空，权限区别于菜单，不需要此字段 */
      o.children = [];
    }
  });
  if(permissions.length) {
    /* 通过id值进行排序 */
    permissions = permissions.sort(cdCompare("id"));
    /* 去重权限数组 */
    permissions = noRepeatObj(permissions, 'id');
  }

  temp.push(menus, permissions);
  return temp;
};

// 添加一个用户信息路由
router.post("/", verifyToken, (req, res) => {
  //使用Hero model上的create方法储存数据
  let roles = req.body.roles;
  let userObj = { ...req.body };
  // 存储到user表时，删除对应的role的id
  delete userObj['roles'];
  if (!userObj.name) {
    return res.json({ status: -1, info: `用户名不能为空` });
  }
  if (!userObj.password) {
    return res.json({ status: -1, info: `密码不能为空` });
  }
  // 加密用户的密码
  userObj.password = userEncrypt(userObj.password);
  !userObj.alias && (userObj.alias = userObj.name);
  // 添加id，根据id进行倒序排序，获取一条数据，即当前最大id值数据
  Users.find({}).sort({ id: -1 }).limit(1)
    .then((allUser) => {
      let maxUserId = allUser[0].id;
      // 避免出现null
      maxUserId = ~~maxUserId;
      // 设置最大id值
      userObj.id = maxUserId + 1;
      Users.create(userObj, (err, hero) => {
        if (err) {
          return res.json({ status: -1, info: `创建用户失败：${err.name} : ${err.message}` });
        } else {
          if (roles.length == 0) {
            return res.json({
              status: 200,
              info: '创建成功',
              data: hero
            })
          } else {
            // 添加到user_roles表中
            let arr = [];
            roles.map(item => {
              let obj = {};
              obj.user_id = hero.id;
              obj.role_id = item;
              arr.push(obj);
            })
            // 一次性加入多条数据
            UsersRoles.create(arr)
              .then(userRo => {
                return res.json({
                  status: 200,
                  info: '创建成功',
                  data: userRo
                })
              })
              .catch(err => {
                return res.json({ status: -1, info: `添加用户权限失败：${err.name} : ${err.message}` });
              })
          }
        }
      });
    })
    .catch(err => {
      return res.json({ status: -1, info: `查询用户失败：${err.name} : ${err.message}` });
    })
});

//更新一条用户信息数据路由
router.put("/:id", verifyToken, (req, res) => {
  let userObj = req.body;
  let userId = req.params.id;
  if (!userObj.name) {
    return res.json({ status: -1, info: `用户名不能为空` });
  }
  !userObj.alias && (userObj.alias = userObj.name);
  let setObj = {
    name: userObj.name,
    alias: userObj.alias,
    update_time: new Date()
  };
  if (userObj.password) {
    // 加密用户的密码
    userObj.password = userEncrypt(userObj.password);
    setObj.password = userObj.password;
  }
  Users.findOneAndUpdate(
    { id: userId },
    {
      $set: setObj
    },
    // new: true，表示返回最新的数据，可以查找后面的内容
    {
      new: true
    }
  )
    .then(user => {
      // 修改时，删除之前的权限，再添加对应的权限
      let roles = userObj.roles;
      UsersRoles.deleteMany({ user_id: userId })
        .then(ur => {
          // 添加到user_roles表中
          let arr = [];
          roles.map(item => {
            let obj = {};
            obj.user_id = userId;
            obj.role_id = item;
            arr.push(obj);
          })
          // 一次性加入多条数据
          UsersRoles.create(arr)
            .then(userRo => {
              return res.json({
                status: 200,
                info: '更新成功',
                data: userRo
              })
            })
            .catch(err => {
              return res.json({ status: -1, info: `添加用户权限失败：${err.name} : ${err.message}` });
            })
        })
        .catch(err => {
          return res.json({ status: -1, info: `删除用户角色失败：${err.name} : ${err.message}` })
        })
      // return res.json({
      //   status: 200,
      //   info: '更新成功',
      //   data: user
      // })
    })
    .catch(err => {
      return res.json({ status: -1, info: `更新用户失败：${err.name} : ${err.message}` })
    });
});

//删除一条用户信息数据路由
router.delete("/:id", verifyToken, (req, res) => {
  // 先删除users_roles表信息，再删除user表信息
  let userId = req.params.id;
  UsersRoles.deleteMany({ user_id: userId })
    .then(ur => {
      Users.findOneAndRemove({
        id: userId
      })
        .then(user => {
          return res.json({ status: 200, info: `${user.name}删除成功` });
        })
        .catch(err => {
          return res.json({ status: -1, info: `删除用户失败：${err.name} : ${err.message}` })
        });
    })
    .catch(err => {
      return res.json({ status: -1, info: `删除用户权限失败：${err.name} : ${err.message}` })
    })
});


module.exports = router; // 注意是exports
