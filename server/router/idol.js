/**
 * idol相关接口
 * @type {createApplication}
 */

const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken } = require("../util/util");
let Idol = db.Idol;

/**
 * 查询所有信息
 * 支持模糊查询、分页
 * 需要token验证(verifyToken)
 */
router.get('/', verifyToken, (req, res) => {
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
	 * $or 模糊查询 可多条件 满足一个即可, 此处是可以通过name或者birthplace进行模糊查询
	 * sort 根据如{id : 1} 进行正序排序，倒序排序为-1
	 * skip 跳过多少条数据
	 * limit 限制返回条数（此分页适用于少数据）
	 * 【--】大数据时，可以参考通过前端传递'_id'，然后根据'_id'倒序排序，查找'$lt'小于此'_id'的值，然后结合limit
	 *      例如.find({'_id': {"$lt": id}}).sort({'_id':-1}).limit(5)
	 */
	Idol.find(
		{
			$or: [
				{ name: { $regex: nameReg } },
				{ birthplace: { $regex: nameReg } }
			]
		})
		.sort(sortTemp)
		.skip(page * size)
		.limit(size)
		.then(idols => {
			if (idols) {
				/**
				 * 返回数据总数、保证模糊查询时返回对应数据的条数
				 */
				Idol.find({ $or: [{ name: { $regex: nameReg } }, { birthplace: { $regex: nameReg } }] }).count()
					.then(co => {
						return res.json({ status: 200, info: '查询成功', content: idols, totalElements: co });
					})
					.catch(err => {
						return res.json({ status: -1, info: `查询失败_2：${err.name} : ${err.message}` });
					});
			} else {
				return res.json({ status: -1, info: '查询失败_1' });
			}
		})
		.catch(err => {
			return res.json({ status: -1, info: `查询失败：${err.name} : ${err.message}` });
		});
})

// 【注意】导出路由
module.exports = router;