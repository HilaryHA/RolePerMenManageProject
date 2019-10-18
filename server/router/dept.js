/**
 * 部门数据相关接口
 * @type {createApplication}
 */
const express = require('express');

const router = express.Router();

const db = require('../models/db');
const {verifyToken} = require('../util/util')

let Dept = db.Dept;

/**
 * 获取部门数据 -- 1表示升序，-1表示降序, verifyToken表示需要token
 */
router.get('/', verifyToken, (req, res) => {  
  // 根据条件获取部门数据
  let findCondition = {};
  let queryTemp = req.query;  //dept?name='部'&enabled=true
  let isQuery = Object.keys(queryTemp); // 判断是否为空对象
  let sortTemp = {};  // {pid: 1}
  let size = 10, page=0;
  if (isQuery.length > 0) {
    // ES6赋值给新对象，但不影响原对象的值
    findCondition = {...queryTemp};
    for (let i in findCondition) {
      if (findCondition[i] == `true`) {
        findCondition[i] = true;
      } else if (findCondition[i] == `false`) {
        findCondition[i] = false;
      }
    }
    // 排序方式
    if (findCondition.sort) {
      let tmp = findCondition.sort.split(',');
      // 字符串转换为数字'1' ---> 1
      tmp[1] = +tmp[1]; 
      sortTemp[tmp[0]] = tmp[1];
    }
    // 查询条数
    if (findCondition.size) {
      // 字符串转换为数字
      size = findCondition.size * 1; 
    }
    // 当前页数
    if (queryTemp.page) {
      page = +queryTemp.page;
    }
  }
  // 搜索条件
  const nameReg = new RegExp(findCondition.name, 'i'); // 不区分大小写
  const whereEnabled = (findCondition.enabled == false || findCondition.enabled == true) ? {enabled: findCondition.enabled} : {};  
  /**
   * $or 多条件模糊查询，选择一个模糊查询，数组
   * where 类似sql的where，参数为对象
   * sort 根据如{id : 1} 进行正序排序，倒序排序为-1
   * skip 跳过多少条数据
   * limit 返回的条数
   */
  Dept.find({
    $or: [
      { name: {$regex: nameReg} }
    ]
  })
  .where(whereEnabled)  
  .sort(sortTemp)
  .skip(page * size)
  .limit(size)
    .then( dept => {
      let temp = getDeptList(dept);
      let data = deleteChildren(temp);

      Dept.find({ $or: [{ name: {$regex: nameReg} }] }).where(whereEnabled).count()
      .then(count => {
        return res.json({ status: 200, info: '获取成功', totalElements: count, content: data });
      })
      .catch(err => {
        return res.json({ status: -1, info: `部门数据计数：${err.name} : ${err.message}` });
      })

      // Dept.find({}).estimatedDocumentCount() // 计数，此方法不能条件查询，另一方法countDocuments
      //   .then(count => {
      //     return res.json({ status: 200, info: '获取成功', totalElements: count, content: data });
      //   })
      //   .catch(err => {
      //     return res.json({ status: -1, info: `部门数据计数：${err.name} : ${err.message}` });
      //   })

    })
    .catch( err => {
      return res.json({ status: -1, info: `获取部门数据：${err.name} : ${err.message}` });
    })
});

/**
 * 创建一条部门数据
 */
router.post('/', verifyToken, (req, res) => {
  let params = req.body; // 获取post参数，因为接口通过application/json类型进行参数传递
  if (!params.name) {
    return res.json({ status: -1, info: `部门名称不能为空` });
  }
  if (typeof params.id === "string") {
    // node.js将字符串转换成数字，带符号右移
    params.id = (params.id) >> 0; // 字符串转换为数字方法【+、*、~~、 >>、 >>>】
  }
  if (typeof params.pid === "string") {
    params.pid = ~~(params.pid);
  }
  Dept.find({}).sort({ id: -1 }).limit(1)   // 根据id进行倒序排序，查找一条
  .then(maxDept => {
    let tmpId = maxDept[0].id + 1;  // 最大id值加一
    params.id = tmpId;
    params['label'] = params.name;
    // params['create_time'] = new Date();  // db.js中有默认值
    // params['children'] = undefined; // 去除多余字段
    // params ['__v'] = undefined;
    console.log('=--------------->', params);
    Dept.create(params)
      .then(dept => {
        return res.json({ status: 200, info: '创建成功', content: dept });
      })
      .catch(err => {
        return res.json({ status: -1, info: `创建部门数据：${err.name} : ${err.message}` });
      })
  })
  .catch(err => {
    return res.json({ status: -1, info: `查询部门数据maxId：${err.name} : ${err.message}` });
  });
})

/**
 * 删除部门数据接口
 */
router.delete('/:id', verifyToken, (req, res) => {
  const conditions = { id: req.params.id };
  Dept.deleteOne(conditions)
    .then(delDept => {
      if (1 == delDept.n) {
        return res.json({ status: 200, info: '删除成功' });
      } else {
        return res.json({ status: -1, info: '删除部门数据有误', data: delDept });
      }
    })
    .catch(err => {
      return res.json({ status: -1, info: `删除部门数据失败：${err.name} : ${err.message}` });
    });
})

/**
 * 修改部门数据接口
 */
router.put('/:id', verifyToken, (req, res) => {
  let updateDept = req.body;
  updateDept.label = updateDept.name;
  updateDept.update_time = new Date();
  Dept.updateOne({id: req.params.id}, updateDept)
    .then(updateDept => {
      if (1 == updateDept.n) {
        return res.json({ status: 200, info: '更新成功' });
      } else {
        return res.json({status: 200, info: '更新部门数据有误', data: updateDept});
      }
    })
    .catch(err => {
      return res.json({ status: -1, info: `更新部门数据失败：${err.name} : ${err.message}` });
    })
})


/**
 * 获取含children的部门
 * 注意：1、data必须先通过pid进行升序排列
 *      2、必须在db.js文件中定义字段时，加入children
 * @param data
 * @param tmp
 * @returns {Array}
 */
const getDeptList = function (data, tmp=[]) {
  data.forEach(deptItem => {
    if(tmp.length == 0) {
      tmp.push(deptItem);
    } else {
      tmp.forEach((da, index) => {
        if (da.id == deptItem.pid) {
          if(da.children == undefined) {
            da.children = [];
          }
          da.children.push(deptItem);
          // 防止加入重复的对象
          if (da.children.length !== 0) {
            // Array.from(new Set(da.children)); // 去除简单类型数组重复元素，如[1, 3, 3, 4, 2]
            // 去除引用类型数组重复元素
            let hashTmp = {};
            da.children = da.children.reduce(function(init, item){
              // init初始值[]，item当前元素
              hashTmp[item.id] ?  '' : hashTmp[item.id]=true && init.push(item);
              return init;
            }, []); // reduce(回调函数，初始值)
          }
        } else if (da.pid == deptItem.pid && da.id != deptItem.id) {
          // 模糊查询时，第一个元素可能不为父元素, 当前元素都同级时
          // 当为不同级模糊查询时有问题
          let tmpIfExit = tmp.every(item => item.id!=deptItem.id);
          if (tmpIfExit) {
            tmp.push(deptItem);
          }
        }
        else if (da.children && da.children.length > 0) {
          getDeptList(data ,da.children)
        }
      })
    }
  })
  return tmp;
}

/**
 * 去除children为空数组的字段
 * @param dept
 * @returns {*|{inline}|Uint8Array|any[]|Int32Array|Uint16Array}
 */
const deleteChildren = function (dept) {
  if (Array.isArray(dept)) {
    return dept.map(item => {
      if (item.children && item.children.length == 0) {
        item.children = undefined;
      } else {
        deleteChildren(item.children);
      }
      return item;
    })
  } else {
   return null;
  }
}


module.exports = router;
