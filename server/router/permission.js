/**
 * 权限信息相关接口
 */

const express = require("express");

const router = express.Router();

const db = require("../models/db");
const { getMenuMaxId, childrenObj, deleteChildren, getAllPerName, verifyToken } = require("../util/util");

let Permission = db.Permission;

/**
 * 获取权限数据 可模糊查询
 */
router.get('/', verifyToken, (req, res) => {
  let queryTemp = req.query;
  let sortTemp = {};
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
  // 搜索条件
  const nameReg = new RegExp(queryTemp.name, 'i'); // 不区分大小写

  /**
   * $or 多条件模糊查询，选择一个模糊查询，数组
   * sort 根据如{id : 1} 进行正序排序，倒序排序为-1
   * skip 跳过多少条数据
   * limit 返回的条数
   */
  Permission.find(
    {
      // 模糊查询 可多条件 满足一个即可
      $or: [
        { name: { $regex: nameReg } }
      ]
    })
    .sort(sortTemp)
    .skip(page * size)
    .limit(size)
    .then(perm => {
      /* 删除children为空的字段 */
      perm = deleteChildren(perm);
      Permission.find({ $or: [{ name: { $regex: nameReg } }] }).count()
        .then(count => {
          return res.json({ status: 200, info: '获取成功', content: perm, totalElements: count });
        })
        .catch(err => {
          return res.json({ status: -1, info: `权限数据计数：${err.name} : ${err.message}` });
        })

    })
    .catch(err => {
      return res.json({ status: -1, info: `查询权限失败：${err.name} : ${err.message}` });
    });
})

/**
 * 查询所有权限name
 */
router.get('/allPerName', verifyToken, (req, res) => {
  Permission.find({})
    .then(supPer => {
      let perArr = [];
      perArr = getAllPerName(supPer);
      return res.json({ status: 200, info: `查询成功`, data: perArr });
    })
    .catch(err => {
      return res.json({ status: -1, info: `查询所有权限失败：${err.name} : ${err.message}` });
    })
})

/**
 * 增加一条权限数据
 */
router.post('/', verifyToken, (req, res) => {
  let params = req.body;
  if (!params.name) {
    return res.json({ status: -1, info: '权限名字不能为空' });
  }
  // 若新增pid为0父级create  否则是增加到已存在的update
  Permission.find({})
    .then(perm => {
      let maxId = getMenuMaxId(perm);
      if (!isNaN(maxId)) {  // isNaN判断true:表示为非数字，!isNaN为true就表示为数字
        params.id = maxId + 1;
        params.label = params.alias;
        params.create_time = new Date();
        params.update_time = params.create_time; // 第一种数据创建，会自动生成时间（定义数据表时写过），但是第二种更新时不会自动生成时间
        params.children = [];

        let tempPid = params.pid;
        // 1' pid为0时
        if (tempPid == 0) {
          Permission.create(params)
            .then(sub => {
              return res.json({ status: 200, info: '创建成功', content: sub });
            })
            .catch(err => {
              return res.json({ status: -1, info: `创建权限失败0：${err.name} : ${err.message}` });
            })
        }
        // 2' 加入已存在的pid下时
        else {
          // 更新上级目录中children字段  $addToSet(结合$each使用，可以增加多个) 比 $ne更好用
          // 若数组里面有这个值，则不插入；没有才插入($addToSet / $ne)
          Permission.updateOne({ id: tempPid }, { $addToSet: { "children": { $each: [params] } } })
            .then(sub => {
              if (1 == sub.n) {
                return res.json({ status: 200, info: '创建成功', data: sub });
              } else {
                return res.json({ status: -1, info: '创建权限数据有误', data: sub });
              }
            })
            .catch(err => {
              return res.json({ status: -1, info: `创建权限失败1：${err.name} : ${err.message}` });
            })
        }
      } else {
        return res.json({ status: -1, info: `获取权限最大值失败：${maxId}` });
      }
    })
    .catch(err => {
      return res.json({ status: -1, info: `查询权限maxId失败：${err.name} : ${err.message}` });
    })

})

/**
 * 修改一条权限数据
 */
router.put('/:id', verifyToken, (req, res) => {
  let permId = req.params.id >> 0;
  let upPerm = req.body;
  if (!permId) {
    return res.json({ status: -1, info: '修改ID值不能为空' });
  }
  if (!upPerm.id) {
    return res.json({ status: -1, info: '请求参数ID不能为空' });
  }
  let nowDate = new Date();
  upPerm.label = upPerm.alias;
  upPerm.update_time = nowDate;

  let tempChild = childrenObj(upPerm);
  /**
   * 【注意】不能修改当前的父元素
   * 1' 修改当前子元素 pid不变
   * 数组元素是对象时，使用$elemMatch， 不是对象时，直接用属性去查找
   */
  Permission.updateOne(
    {
      id: upPerm.pid,
      children: { $elemMatch: { id: permId } }
    },
    { $set: tempChild })
    .then(perm => {
      if (1 == perm.n) {
        return res.json({ status: 200, info: '修改成功', data: perm });
      } else {
        upPerm.create_time = nowDate;
        // 2' 修改当前子元素 pid改变
        // 2-1' pid为0情况（create）
        if (upPerm.pid == 0) {
          Permission.create(upPerm)
            .then(sub => {
              return res.json({ status: 200, info: '修改成功', data: sub });
            })
            .catch(err => {
              return res.json({ status: -1, info: `当前元素ID${permId}不存在0：${err.name} : ${err.message}` });
            })
        } else {
          // 2-2' pid已有children（update） 需要先删除当前children的子元素， 再添加子元素到对应的children中
          Permission.updateOne(
            { children: { $elemMatch: { id: permId } } },
            { $pull: { "children": { id: permId } } })
            .then(delPerm => {
              if (1 == delPerm.n) {
                Permission.updateOne(
                  { id: upPerm.pid },
                  { $addToSet: { "children": { $each: [upPerm] } } })
                  .then(sub => {
                    return res.json({ status: 200, info: '修改成功', data: { sub, upPerm } });
                  })
                  .catch(err => {
                    return res.json({ status: -1, info: `修改权限失败1：${err.name} : ${err.message}` });
                  })
              }
            })
            .catch(err => {
              return res.json({ status: -1, info: `当前元素ID${permId}不存在1：${err.name} : ${err.message}` });
            })
        }
      }
    })
    .catch(err => {
      return res.json({ status: -1, info: `修改权限失败0：${err.name} : ${err.message}` });
    });

})

/**
 * 删除一条权限数据
 */
router.delete('/:id', verifyToken, (req, res) => {
  const permId = ~~req.params.id;
  if (!permId) {
    return res.json({ status: -1, info: '删除ID值不能为空' })
  }
  Permission.find({ id: permId })
    .then(perm => {
      // 1' 删除父级，pid为0, 其中下面的子集也会被删除
      //    查询id，若查到id值，则表示为父级
      if (perm.length > 0) {
        Permission.deleteOne({ id: permId })
          .then(sub => {
            if (1 == sub.n) {
              return res.json({ status: 200, info: '删除成功' });
            } else {
              return res.json({ status: -1, info: `删除权限${permId}有误0`, data: sub });
            }
          })
          .catch(err => {
            return res.json({ status: -1, info: `删除权限${permId}失败0：${err.name} : ${err.message}` });
          })
      }
      // 2' 删除子级，pid不为0
      //    若id值查不到，则表示为子级
      else {
        Permission.updateOne(
          { children: { $elemMatch: { id: permId } } },
          { $pull: { "children": { id: permId } } }
        )
          .then(sub => {
            if (1 == sub.n) {
              return res.json({ status: 200, info: '删除成功' });
            } else {
              return res.json({ status: -1, info: `删除权限${permId}有误1`, data: sub });
            }
          })
          .catch(err => {
            return res.json({ status: -1, info: `删除权限${permId}失败1：${err.name} : ${err.message}` });
          })
      }
    })
    .catch(err => {
      return res.json({ status: -1, info: `查找权限${permId}失败：${err.name} : ${err.message}` });
    })

})

module.exports = router;
