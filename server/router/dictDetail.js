/**
 * 字典详细数据相关接口
 * @type {createApplication}
 */
const express = require('express');

const router = express.Router();

const db = require('../models/db');
const { verifyToken } = require("../util/util");

let Dict = db.Dict;
let DictDetail = db.DictDetail;

// 获取字典
router.get('/:name', verifyToken, (req, res) => {
  // let params = req.query; // 接口对应的?id=12 , 若通过json模式，通过req.body获取
  let name = req.params.name; // 对应接口http://localhost:3000/dictDetail/dept_status
  Dict.find({ name: name})
    .then(dict => {
      if (dict && dict.length == 1) {
        let dictId = dict[0].id;
        DictDetail.find({ dict_id: dictId})
          .then(dictDetail => {
            console.log(dictDetail);
            return res.json({ status: 200, info: '获取成功', content: dictDetail });
          })
          .catch(err => {
            return res.json({ status: -1, info: `获取详细字典：${err.name} : ${err.message}` });
          })
      } else {
        return res.json({ status: -1, info: `获取字典数据为空` });
      }
    })
    .catch(err => {
      return res.json({ status: -1, info: `获取字典：${err.name} : ${err.message}` });
    })

})

module.exports = router;
