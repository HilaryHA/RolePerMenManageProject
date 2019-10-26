/**
 * 日志相关接口
 * @type {createApplication}
 */

const express = require('express');
const fs = require('fs');			  // 操作文件
const readline = require('readline'); // 按行读取
const domain = require('domain');     // 处理异常
const router = express.Router();
const db = require('../models/db');
const { verifyToken, noRepeat } = require("../util/util");
let Logs = db.Logs;
let Users = db.Users;

/**
 * 【查询GET接口】 查询所有信息 -- 支持模糊查询、分页
 */
router.get('/', getLineFile, (req, res) => {
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
	Logs.find(
		{
			$or: [
				{ name: { $regex: nameReg } },
				{ birthplace: { $regex: nameReg } }
			]
		})
		.sort(sortTemp)
		.skip(page * size)
		.limit(size)
		.then(logInfo => {
			if (logInfo) {
				/**
				 * 返回数据总数、保证模糊查询时返回对应数据的条数
				 */
				Logs.find({ $or: [{ name: { $regex: nameReg } }, { birthplace: { $regex: nameReg } }] }).count()
					.then(co => {
						return res.json({ status: 200, info: '查询成功', content: logInfo, totalElements: co });
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

/**
 * 按行读取 --点击日志列表时，将数据存入数据库中
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function getLineFile(req, res, next) {
	let date = new Date();
	if (Object.keys(req.query).length && req.query.date) {
		date = new Date(req.query.date);
	}
	let month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
	let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	let te = `${date.getFullYear()}-${month}-${day}`;
	let filePath = `logs/wwt-.${te}.log`;
	// let outPath = `logs/wwt-write-.${te}.log`;
	let d = domain.create();
	d.on('error', function (e) {
		/* 处理异常，捕获异常，并且进程正常运行（try catch方式不能捕获异常，即导致进程退出） */
		console.error(`Error：${e.name} : ${e.message}`);
		/* 若没有文件，就将日志表清空，然后调用回调函数 */
		Logs.remove().then(() => next()).catch(err => { return res.json({ status: -1, info: `文件异常 ${err.name}:${err.message}` }) })
	})
	/* 运行函数 */
	d.run(() => { readDateFile(req, res, next, filePath) });
}

/**
 * 根据日期读取文件 【问题： 用户退出之后，token值变化，获取不到之前的username】
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} filePath 
 */
async function readDateFile(req, res, next, filePath) {
	const input = await fs.createReadStream(filePath);
	// 写入对应的用户名，可以使用output.write()或者fs.appendFile()，os.EOL表示换行（ 需要引入let os = require('os') ）
	// const output = await fs.createWriteStream(outPath); 
	const rl = readline.createInterface({
		input: input
	})
	let logInfo = [];
	rl.on('line', (line) => {
		// 每读一行，都触发此监听事件。【注意】 若在此处查询每条，token对应的用户名，可能会在rl.close()调用后，还在执行，因为读取数据库是异步的，即读每一行的顺序不定
		logInfo.push(line);
	})
	rl.on('close', (line) => {
		let newArr = noRepeat(logInfo);
		let tokenArr = [];
		newArr.forEach((item, index) => {
			let tempArr = item.split(' ');
			let tempToken = tempArr[9].split('"')[1];
			tokenArr.push(tempToken);
		})
		if (tokenArr.length) {
			// 【根据查询的token值，获取对应的name】
			Users.find({
				token: {
					$in: tokenArr
				}
			}, { token: 1, name: 1, alias: 1 })
				.then(users => {
					newArr = newArr.map(item => {
						if (users.length) {
							let tempArr = item.split(' ');
							let tempToken = tempArr[9].split('"')[1];
							users.forEach(it => {
								it.token == tempToken ?
									(item = `${item} ${it.name}-${it.alias}`) :
									(item = `${item} 未知-${tempArr[9].slice(0, 9)}`);
							})
						}
						return item;
					})
					// 写入数据库 -- 调用写入函数
					logsCreateData(req, res, next, newArr);
				})
				.catch(err => {
					/* 因为上述domain已经捕获异常了，所以此处不用调用res.send函数 */
					console.error(`【err======】：${err.name} : ${err.message}`);
				})
		}
	})
}

/**
 * 格式化读取的数据，并存入数据库中
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} arr 
 */
function logsCreateData(req, res, next, arr) {
	let insertArr = []; // 同时插入多条数据
	arr.length && arr.forEach((element, index) => {
		let teArr = element.split(' '); // 根据空格截取
		if (teArr[4] != 'OPTIONS') {  // 若方法等于'OPTIONS'则不存入
			let endArr = [];
			let obj = {};
			endArr = teArr.map(it => {
				let regExpTm = /^\[.+\]$/; // 匹配正则，判断是否是中括号括起来的数据
				if (regExpTm.test(it)) {
					it = it.split('[')[1].split(']')[0];
				}
				return it;
			})
			// 将日志存入数据库中，首先根据endArr[9]token值找到对应的用户，然后存入到日志表中，注意去除token多余的双引号'"'
			obj.id = 1;
			obj.name = endArr[endArr.length - 1];
			obj.detail = `${endArr[5]} --> ${endArr[4]} --> ${endArr[6]} --> ${endArr[7]}`
			obj.address = endArr[8]
			obj.create_time = endArr[0];
			obj.update_time = obj.create_time;
			insertArr.push(obj);
			if (index == arr.length - 2 || index == arr.length - 1) {	// 【当为最后一条存入时】 因为打印出来，只读取到倒数第二条，或倒数第一条就不执行了
				insertArr.length && Logs.remove() // 【移除所有日志】
					.then(ye => {
						Logs.find({}).sort({ id: -1 }).limit(1) // 【设置最大日志id】
							.then(maxDa => {
								let maxId = 1; // 默认值
								if (maxDa.length) {
									maxId = maxDa[0].id + 1;
								}
								insertArr = getNewLogArr(insertArr);
								for (let i = 0; i < insertArr.length; i++) {
									if (i == 0) {
										insertArr[i].id = maxId;
									} else {
										insertArr[i].id = insertArr[i - 1].id + 1;
									}
								}
								Logs.insertMany(insertArr) // 【插入所有当天日志信息】 -- 一次存入多条数据
									.then(manyLog => {
										next(); // 【成功执行回调函数】
									})
									.catch(err => {
										return res.json({ status: -1, info: `插入日志失败 ${err.name}:${err.message}` })
									})
							})
							.catch(err => {
								return res.json({ status: -1, info: `查询日志最大值id失败 ${err.name}:${err.message}` })
							})
					})
					.catch(err => {
						return res.json({ status: -1, info: `清空日志失败 ${err.name}:${err.message}` })
					})
			}
		}
	})
}

/**
 * 去除重复log日志，根据时间、address
 * @param {*} arr 
 */
function getNewLogArr(arr) {
	let newArr = [];
	newArr = arr.filter((item, index) => {
		if (index == 0) {
			return item;
		} else if (index != 0 && item.create_time != arr[index - 1].create_time && item.address != arr[index - 1].address) {
			return item;
		}
	})
	return newArr;
}

// 【注意】导出路由
module.exports = router;