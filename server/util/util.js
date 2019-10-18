const fs = require('fs'); // 读写文件
const path = require('path'); // 地址
const jwt = require('jsonwebtoken'); // 跨域认证解决方案
const crypto = require('crypto'); // 提供通用的加密和哈希算法
const bcrypt = require('bcryptjs'); // 引入第三方库
const readFile = require('util').promisify(fs.readFile);

/**
 * 【获取所有元素中最大id值】
 * 需求：对应mongodb数据表中有children数组字段
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
 * @returns {*}
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
 * 【通过字段pid，将数据转换含有对应的children字段数组】
 * 需求：对应mongodb数据表中都是单独一条数据，子pid等于父id
 * 注意：1、data必须先通过pid进行升序排列
 *      2、必须在db.js文件中定义字段时，加入children
 * @param data
 * @param tmp
 * @returns {Array}
 */
const getDeptList = function (data, tmp = []) {
  data.forEach(deptItem => {
    if (tmp.length == 0) {
      tmp.push(deptItem);
    } else {
      tmp.forEach((da, index) => {
        if (da.id == deptItem.pid) {
          if (da.children == undefined) {
            da.children = [];
          }
          da.children.push(deptItem);
          // 防止加入重复的对象
          if (da.children.length !== 0) {
            // Array.from(new Set(da.children)); // 去除简单类型数组重复元素，如[1, 3, 3, 4, 2]
            // 去除引用类型数组重复元素
            let hashTmp = {};
            da.children = da.children.reduce(function (init, item) {
              // init初始值[]，item当前元素
              hashTmp[item.id] ? '' : hashTmp[item.id] = true && init.push(item);
              return init;
            }, []); // reduce(回调函数，初始值)
          }
        } else if (da.pid == deptItem.pid && da.id != deptItem.id) {
          // 模糊查询时，第一个元素可能不为父元素, 当前元素都同级时
          // 当为不同级模糊查询时有问题
          let tmpIfExit = tmp.every(item => item.id != deptItem.id);
          if (tmpIfExit) {
            tmp.push(deptItem);
          }
        }
        else if (da.children && da.children.length > 0) {
          getDeptList(data, da.children)
        }
      })
    }
  })
  return tmp;
}

/**
 * 【去除children为空数组的字段】
 * @param dept 数组数据
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

/**
 * 将对象转换为mongodb修改时需要的格式
 * @param data
 * @returns {{}}
 */
const childrenObj = function (data) {
  let obj = {};
  if (data instanceof Object) {
    Object.keys(data).forEach(it => {
      obj[`children.$.${it}`] = data[it];
    })
  }
  return obj;
}

/**
 * 获取所有权限name
 * @param data
 */
const getAllPerName = function (data, arr = []) {
  data.forEach(it => {
    arr.push(it.name);
    if (it.children && Array.isArray(it.children) && it.children.length > 0) {
      getAllPerName(it.children, arr);
    }
  });
  return arr;
}

/**
 * 根据数组对象某属性进行比较
 * such as: children.sort(cdCompare("id"))
 * @param {*} prop
 */
const cdCompare = function(prop) {
  return function (obj1, obj2) {
    let x = obj1[prop];
    let y = obj2[prop];
    return x - y;
  }
}

/**
 * 生成token方法
 * @param {*} data
 * @returns {*} token
 */
const generateToken = function (data) {
  let created = Math.floor(Date.now() / 1000);
  let cert = fs.readFileSync(path.join(__dirname, '../config/private.pem')); // 私钥
  let token = jwt.sign({
    data,
    exp: created + 3600 * 3
  }, cert); // 期限为3小时
  return token;
}

/**
 * 验证token是否过期
 * @param {*} token 
 */
const verifyToken = function (req, res, next) {
  let token = req.headers['authorization']; // 获取请求头的token值
  let cert = fs.readFileSync(path.join(__dirname, '../config/public.pem')); // 公钥
  try {
    if (!token) { return res.json({ status: 401, info: 'No token provided.' }); }
    // return res.status(401).send({ auth: false, message: 'No token provided.' });

    token = token.split('"')[1]; // 去掉双引号
    let result = jwt.verify(token, cert) || {};
    let {exp = 0} = result, current = Math.floor(Date.now() / 1000);
    // token限制时间内
    if (current <= exp) {
      let url = req.url;
      // token验证通过
      if (url.indexOf('logout') == -1) {
        next();
      } else {
        // 退出登录
        return res.json({ status: 200, info: '退出登录成功' })
      }      
    } else {
      return res.json({ status: 403, info: '登录过期，请重新登录' });
    }
  } catch (err) {
    return res.json({ status: -1, info: `${err.name}: ${err.message}` });
  }
}

/**
 * 用户注册加密
 * @param {*} password 原始密码
 */
const userEncrypt = function (password) {
  // 方法1`
  // var salt = bcrypt.genSaltSync(10);
  // var hash = bcrypt.hashSync("B4c0/\/", salt);
  // let result = bcrypt.compareSync("B4c0/\/", hash); // true   
  // console.log('encrypted by key: ' + hash);
  // console.log('decrypted by key: ' + result);
  // return `${hash} : ${result}`;

  // 方法2`
  // let secret = 'pass test';
  // var cipher = crypto.createCipher('aes192',secret);
	// var enc = cipher.update(password,'utf8','hex');
	// enc += cipher.final('hex');

  // var decipher = crypto.createDecipher('aes192',secret);
	// var dec = decipher.update(enc,'hex','utf8');
	// dec += decipher.final('utf8');
  // console.log('encrypted by sercet password: ' + enc);
  // console.log('decrypted by origin password: ' + dec);
  // return `${enc} : ${dec}`;

  
  // 方法3`
  let prvKey = fs.readFileSync(path.join(__dirname, '../config/rsa-prv.pem'), 'utf8');
  // pass = 'This is my password'
  let enc_by_prv = crypto.privateEncrypt(prvKey, Buffer.from(password, 'utf8'));
  // 转换成16进制字符串
  // console.log('encrypted by private key: ' + enc_by_prv.toString('hex'));
  return enc_by_prv.toString('hex');
}

 /**
  * 用户注册解密
  * @param {*} encrPass 加密后的密码
  */
const userDecrypt = function (enc_by_prv) {
  // 转换为Buffer对象
  enc_by_prv = Buffer.from(enc_by_prv, 'hex')
  // console.log('enc_by_prv-----------------: ' , enc_by_prv);
  let pubKey = fs.readFileSync(path.join(__dirname, '../config/rsa-pub.pem'), 'utf8');
  let dec_by_pub = crypto.publicDecrypt(pubKey, enc_by_prv);
  // console.log('decrypted by public key: ' + dec_by_pub.toString('utf8'));
  return dec_by_pub.toString('utf8');
}

/**
 * 支付宝统一收单线下交易查询
 * @param {Object} queryObj {'alipay_trade_query_response': {...}, 'sign': 'xxx'}
 * @returns {String} msg API公告返回码对应的描述
 */
const getResponseMsg = function (queryObj) {
  let msg = '';
  if(queryObj instanceof Object && Object.keys(queryObj).length > 0) {
    let code = queryObj.alipay_trade_query_response.code;
    switch(code) {
      case '10000':
        msg = '接口调用成功';
        break;
      case '20000':
        msg = '服务不可用';
        break;
      case '20001':
        msg = '授权权限不足';
        break;
      case '40001':
          msg = '缺少必选参数';
          break;
      case '40001':
          msg = '缺少必选参数';
          break;
      case '40002':
          msg = '非法的参数';
          break;
      case '40004':
          msg = '业务处理失败';
          break;
      case '40006':
          msg = '权限不足';
          break;
    }
  }
  return msg;
}

/**
 * 数组去重[基本类型元素]
 * @param {Array} arr 
 */
const noRepeat = function(arr) {
  return [...new Set(arr)];
}

/**
 * 数组去重[引用类型元素]
 * @param {Array} arr 数组
 * @param {String} typeName 属性名（唯一性）
 */
const noRepeatObj = function (arr, typeName) {
  let hashTmp = {};
  arr = arr.reduce(function (init, item) {
    // init初始值[]，item当前元素
    hashTmp[item[typeName]] ? '' : hashTmp[item[typeName]] = true && init.push(item);
    return init;
  }, []); // reduce(回调函数，初始值)
  return arr;
}

/**
 * 创建文件夹
 * @param {*} folder 文件夹名
 */
const createFolder = function(folder) {
  try {
    fs.accessSync(folder);
  } catch(err) {
    fs.mkdirSync(folder);
  }
}

/**
 * 是否存在文件
 * @param {*} fileName 文件名
 */
const isPresenceFile = async function(fileName) {
  let falg = false;
  try{
    const rf = await fs.readFileSync(path.join(__dirname, fileName));
    falg = true;
    return falg;
  } catch(err) {
    console.error(`【err=========】${err.name}: ${err.message}`);
    falg = false;
    return falg;
  }
}



// mongodb+node.js中导出需要使用module.exports
// 区别于 ES6使用export导出
module.exports = {
  getMenuMaxId,
  getDeptList,
  deleteChildren,
  childrenObj,
  getAllPerName,
  cdCompare,
  generateToken,
  verifyToken,
  userEncrypt,
  userDecrypt,
  getResponseMsg,
  noRepeat,
  noRepeatObj,
  createFolder,
  isPresenceFile
}
