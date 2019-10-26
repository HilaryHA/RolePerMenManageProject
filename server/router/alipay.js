/**
 * 支付相关接口
 * @type {createApplication}
 */
const express = require("express");
const fs = require('fs');
const path = require('path');
const request = require('request');

// 定义路由级中间件
const router = express.Router();

// 引入数据模型模块
const db = require("../models/db");
const { verifyToken, getResponseMsg } = require("../util/util");
let Alipay = db.Alipay;

// JS规则引入node sdk
const AlipaySdk = require('alipay-sdk').default;
const AlipayFormData = require('alipay-sdk/lib/form').default;

/**
 * 测试接口
 */
router.get('/test', (req, res) => {
	Alipay.find({})
		.then(async ap => {
			// https://www.yuque.com/chenqiu/alipay-node-sdk/config-sdk
			const alipaySdk = new AlipaySdk({
				// 沙箱地址：https://openhome.alipay.com/platform/appDaily.htm?tab=info
				// appId需要沙箱对应的appId:'2016091800536139'，这是正式app_id:'2019092067599741'(此处属性名都改成了驼峰命名)
				appId: '2016091800536139',
				// fs.readFileSync(路径、指定编码格式、callback)
				privateKey: fs.readFileSync(path.join(__dirname, '../config/alipay_key/app_private_key.pem'), 'ascii'),
				// 默认是RSA2  但是我们沙箱应用配置的是RSA密钥
				signType: 'RSA',
				alipayPublicKey: fs.readFileSync(path.join(__dirname, '../config/alipay_key/alipay_public_key.pem'), 'ascii'),
				// 放沙箱里的测试网关'https://openapi.alipaydev.com/gateway.do',这是正式网关:'https://openapi.alipay.com/gateway.do'
				gateway: 'https://openapi.alipaydev.com/gateway.do',
				timeout: 5000,
				camelcase: true
			});

			// 【1】：返回form表单（PC 支付接口）
			// const formData = new AlipayFormData();
			// formData.addField('notifyUrl', 'http://www.com/notify');
			// formData.addField('bizContent', {
			// 	outTradeNo: 'out_trade_no',
			// 	productCode: 'FAST_INSTANT_TRADE_PAY',
			// 	totalAmount: '0.01',
			// 	subject: '商品',
			// 	body: '商品详情',
			// });

			// const result = await alipaySdk.exec(
			// 	'alipay.trade.page.pay',
			// 	{},
			// 	{ formData: formData },
			// );

			// // result 为 form 表单
			// console.log(result);


			// 【2】：返回支付链接（PC 支付接口）
			const formData = new AlipayFormData();
			// 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
			formData.setMethod('get');

			// 支付宝服务器主动通知商户服务器里指定的页面http/https路径
			// formData.addField('notifyUrl', 'http://www.com/notify');
			// formData.addField('appId', '2019092067599741');
			formData.addField('appId', '2016091800536139');
			formData.addField('charset', 'utf-8');
			// formData.addField('signType', 'RSA2');
			formData.addField('signType', 'RSA');

			//  https://docs.open.alipay.com/api_1/alipay.trade.page.pay/
			formData.addField('bizContent', {
				outTradeNo: 'TEST_1569380127321', // 【必选】商户订单号,64个字符以内、可包含字母、数字、下划线；需保证在商户端不重复
				productCode: 'FAST_INSTANT_TRADE_PAY', // 【必选】销售产品码，与支付宝签约的产品码名称,注：目前仅支持FAST_INSTANT_TRADE_PAY
				totalAmount: '0.01', // 【必选】订单总金额，单位为元，精确到小数点后两位
				subject: '商品', // 【必选】订单标题
				body: '商品详情' // 【可选】 订单描述
			});

			/**
			 * exec对应参数：method（调用的支付宝Api），params（Api 的请求参数（包含“公共请求参数”和“业务参数”）），options（validateSign、formData、log）
			 */
			const result = await alipaySdk.exec(
				'alipay.trade.page.pay',
				{},
				{ formData: formData }
			);

			// result 为可以跳转到支付链接的 url
			console.log(result);

			return res.json({ status: 200, info: '查询成功', ap, result });
		})
		.catch(err => {
			return res.json({ status: -1, info: `支付查询失败0：${err}` });
		})
});

/**
 * 创建支付订单、返回支付页面 -- 需要token验证（verifyToken）
 */
router.post('/', verifyToken, async (req, res) => {
	let obj = req.body;
	// 转换'1'为数字1
	obj.fruitApple = +obj.fruitApple;
	obj.fruitMango = obj.fruitMango >> 0;
	obj.fruitDragonFruit = obj.fruitDragonFruit * 1;
	obj.fruitOrange = ~~obj.fruitOrange;
	obj.price = obj.price >> 0;

	let outTradeNo = "WWT_FRUIT_" + Date.now();

	// 参考 https://www.yuque.com/chenqiu/alipay-node-sdk/config-sdk
	const alipaySdk = new AlipaySdk({
		appId: '2016091800536139',
		privateKey: fs.readFileSync(path.join(__dirname, '../config/alipay_key/app_private_key.pem'), 'ascii'),
		signType: 'RSA',
		alipayPublicKey: fs.readFileSync(path.join(__dirname, '../config/alipay_key/alipay_public_key.pem'), 'ascii'),
		gateway: 'https://openapi.alipaydev.com/gateway.do',
		timeout: 5000,
		camelcase: true
	});

	// 返回支付链接（PC 支付接口）
	const formData = new AlipayFormData();
	formData.setMethod('get');
	formData.addField('appId', '2016091800536139');
	formData.addField('returnUrl', 'http://192.168.7.12:8099/in/payment');	// 【支付成功后跳转到商户地址】HTTP/HTTPS开头字符串
	formData.addField('charset', 'utf-8');
	formData.addField('signType', 'RSA');

	// 参考 https://docs.open.alipay.com/api_1/alipay.trade.page.pay/
	formData.addField('bizContent', {
		outTradeNo: outTradeNo, 	// 【必选】商户订单号,64个字符以内、可包含字母、数字、下划线；需保证在商户端不重复
		productCode: 'FAST_INSTANT_TRADE_PAY',	 // 【必选】销售产品码，与支付宝签约的产品码名称,注：目前仅支持FAST_INSTANT_TRADE_PAY
		totalAmount: obj.price, // '0.01'  【必选】订单总金额，单位为元，精确到小数点后两位
		subject: obj.name, 	// 【必选】订单标题
		body: obj.remarks	 // 【可选】 订单描述
	});

	/**
	 * exec对应参数：method（调用的支付宝Api），params（Api 的请求参数（包含“公共请求参数”和“业务参数”）），options（validateSign、formData、log）
	 */
	await alipaySdk.exec(
		'alipay.trade.page.pay',
		{},
		{ formData: formData }
	).then(result => {
		obj.orderId = outTradeNo;
		obj._id = obj.orderId;
		Alipay.create(obj)
			.then(ap => {
				return res.json({ status: 200, info: '支付成功', data: result, ap });
			})
			.catch(err => {
				return res.json({ status: -1, info: `支付失败_1：${err.name} : ${err.message}` });
			});
	}).catch(err => {
		return res.json({ status: -1, info: `支付失败：${err.name} : ${err.message}` });
	});

});

/**
 * 查询订单支付状态
 */
router.get('/:tradeNo', verifyToken, async (req, res) => {
	let outTradeNo = req.params.tradeNo;
	if (!outTradeNo) {
		return res.json({ status: -1, info: `支付查询需要订单号` });
	}
	const alipaySdk = new AlipaySdk({
		appId: '2016091800536139',
		privateKey: fs.readFileSync(path.join(__dirname, '../config/alipay_key/app_private_key.pem'), 'ascii'),
		signType: 'RSA',
		alipayPublicKey: fs.readFileSync(path.join(__dirname, '../config/alipay_key/alipay_public_key.pem'), 'ascii'),
		gateway: 'https://openapi.alipaydev.com/gateway.do',
		timeout: 5000,
		camelcase: true
	});
	// 返回支付状态（PC 支付接口）
	const formData = new AlipayFormData();
	formData.setMethod('get');
	formData.addField('appId', '2016091800536139');
	formData.addField('charset', 'utf-8');
	formData.addField('signType', 'RSA');
	formData.addField('bizContent', {
		outTradeNo: outTradeNo 	// 【必选】商户订单号,64个字符以内、可包含字母、数字、下划线；需保证在商户端不重复
	});
	await alipaySdk.exec(
		'alipay.trade.query',
		{},
		{ formData: formData }
	).then(result => {
		// 【注意】上诉请求result返回的是https的url,即get访问该网址，会返回对应的查询结果，所以需要借助request发送https请求
		if (result) {
			request(result, function (error, response, body) {
				let obj = JSON.parse(body);
				let msg = getResponseMsg(obj);
				console.log('[alipay.trade.query--msg]====>', msg);
				console.log('[alipay.trade.query]====>', obj);
				if (!error && response.statusCode == 200) {
					return res.json({ status: 200, info: '支付查询成功' });
				} else {
					return res.json({ status: -1, info: `支付查询失败_2：${error.name} : ${error.message}` });
				}
			})
		} else {
			return res.json({ status: -1, info: `支付查询失败_1：${result.name} : ${result.message}` });
		}
	}).catch(err => {
		return res.json({ status: -1, info: `支付查询失败：${err.name} : ${err.message}` });
	});
});

/**
 * 查询所有数据 -- 支持模糊查询、分页
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
	 * $or 模糊查询 可多条件 满足一个即可, 此处是可以通过name或者orderId进行模糊查询
	 * sort 根据如{id : 1} 进行正序排序，倒序排序为-1
	 * skip 跳过多少条数据
	 * limit 限制返回条数（此分页适用于少数据）
	 * 【--】大数据时，可以参考通过前端传递'_id'，然后根据'_id'倒序排序，查找'$lt'小于此'_id'的值，然后结合limit
	 *      例如.find({'_id': {"$lt": id}}).sort({'_id':-1}).limit(5)
	 */
	Alipay.find(
		{
			$or: [
				{ name: { $regex: nameReg } },
				{ orderId: { $regex: nameReg } }
			]
		})
		.sort(sortTemp)
		.skip(page * size)
		.limit(size)
		.then(alipays => {
			//   console.log('========================alipayshhh=========================');
			//   console.log(alipays);
			if (alipays) {
				/**
				 * 返回数据总数、保证模糊查询时返回对应数据的条数
				 */
				Alipay.find({ $or: [{ name: { $regex: nameReg } }, { orderId: { $regex: nameReg } }] }).count()
					.then(co => {
						return res.json({ status: 200, info: '查询成功', content: alipays, totalElements: co });
					})
					.catch(err => {
						return res.json({ status: -1, info: `查询失败_2：${err.name} : ${err.message}` });
					});
			} else {
				return res.json({ status: -1, info: `查询失败_1: ${alipays}` });
			}
		})
		.catch(err => {
			return res.json({ status: -1, info: `查询失败：${err.name} : ${err.message}` });
		});
});

/**
 * 删除订单
 */
router.delete('/:tradeNo', verifyToken, (req, res) => {
	let tradeNo = req.params.tradeNo;
	Alipay.findOneAndRemove({
		orderId: tradeNo
	})
		.then(ap => {
			return res.json({ status: 200, info: `订单${ap.orderId}-${ap.name}删除成功` });
		})
		.catch(err => {
			return res.json({ status: -1, info: `删除订单失败：${err.name} : ${err.message}` })
		});
});


// 【注意】导出路由
module.exports = router;


