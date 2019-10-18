/**
 * 日志存储
 */
var log4js = require('log4js');

levels = {
  'trace': log4js.levels.TRACE,
  'debug': log4js.levels.DEBUG,
  'info': log4js.levels.INFO,
  'warn': log4js.levels.WARN,
  'error': log4js.levels.ERROR,
  'fatal': log4js.levels.FATAL
};

log4js.configure({
  appenders: {
    //控制台输出
    console: { "type": "console" },
    file: {
      type: 'file',
      filename: 'logs/wwt-things.log',
      maxLogSize: 10 * 1024 * 1024, // = 10Mb
      backups: 5, // keep five backup files
      compress: true, // compress the backups
      encoding: 'utf-8',
      mode: 0o0640, // ?
      flags: 'w+' // ?
    },
    dateFile: {
      type: 'dateFile',
      //文件名为： filename + '.' + pattern, 设置为alwaysIncludePattern：true
      filename: 'logs/wwt-',  // 需要手动创建logs文件夹
      pattern: 'yyyy-MM-dd.log',
      // pattern: 'yyyy-MM-dd-hh-mm-ss.log',
      compress: true,
      //包含模型
      alwaysIncludePattern: true
    }
  },
  categories: {
    dateFile: { appenders: ['dateFile'], level: 'error' },
    another: { appenders: ['console'], level: 'trace' },
    default: { appenders: ['console', 'file', 'dateFile'], level: 'trace' }
  }
  // replaceConsole: true // 替换 console.log
})

exports.logger = function (name, level) {
  var logger = log4js.getLogger(name);
  //默认为debug权限及以上
  logger.setLevel(levels[level] || levels['debug']);
  return logger;
};

exports.use = function (app, level) {
  //加载中间件
  app.use(log4js.connectLogger(log4js.getLogger('【logInfo】'), {
    level: levels[level] || levels['debug'],
    //格式化http相关信息
    format: (req, res, format) => format(`:method :url HTTP/:http-version :status :referrer ${req.headers['authorization']} "${Date.now()}"`)
  }));
};




// format: (req, res, format) => {
//   // return format(`:method :url HTTP/:http-version :status :referrer ${req.headers['authorization']} "未知"`)
//   let token = req.headers['authorization'];
//   (typeof token == 'string') && (token = token.split('"')[1]); // 去除双引号
//   console.log('[token============]', token)
//   Users.find({ token })
//   .then(user => {
//     console.log('[user============]', user)
//     // if (user.length) {

//     // }
//     // return format(`:method :url HTTP/:http-version :status :referrer ${req.headers['authorization']} ${user.length ? user[0].name : "未知"}`)
//     return format(`:method :url HTTP/:http-version :status :referrer ${req.headers['authorization']} "未知"`)
//   })
//   .catch(err => {
//     res.json({ status: -1, info: err })
//   })      
// }





// 引入存入数据库中需要的模块
// const readline = require('readline');
// const fs = require('fs');
// const db = require('./db');
// const { noRepeat } = require('../util/util');

// let Logs = db.Logs;
// let Users = db.Users;
// function judgePath(pathStr) {
//   if (!fs.existsSync(pathStr)) {
//     fs.mkdirSync(pathStr);
//     console.log('createPath: ' + pathStr);
//   }
// }

// // 异步读取文件，避免未读时，就返回值
// const readFile = require('util').promisify(fs.readFile);
// async function getFileData(filePath) {
//   try{
//     const fr = await readFile(filePath, 'utf-8');
//     console.log('fr', fr);
//     return fr;
//   } catch(err) {
//     console.log('Error', err);
//   }
// }

// // 按行读取 --点击日志列表时，读取文件
// async function getLineFile(filePath) {
//   try{
//     const input = await fs.createReadStream(filePath);
//     const rl = readline.createInterface({
//       input: input
//     })
//     let logInfo = [];
//     rl.on('line', (line) => {
//       // 每读一行，都触发此监听事件
//       logInfo.push(line);
//     })
//     rl.on('close', (line) => {
//       // 读取完毕之后触发
//       console.log('[close==]', line);
//       // 数组去重
//       let newArr = noRepeat(logInfo);
//       console.log('[logInfo-length==]', logInfo);
//       console.log('[newArr-length==]', newArr);
//       console.log('[读取完毕]');

//       // 写入数据库 -- 调用写入函数
//       logsCreateData(newArr);
//     })
//   } catch(err) {
//     console.log('Error', err);
//   }
// }

// function logsCreateData (arr) {
//   arr.length && arr.forEach(element => {
//     // 根据空格截取
//     let teArr = element.split(' ');
//     // 若方法等于'OPTIONS'则不存入
//     console.log('[teArr========]',teArr);
//     console.log('[teArr[4]========]',teArr[4]);
//     if(teArr[4] != 'OPTIONS') {
//       let endArr = [];
//       endArr = teArr.map(it => {
//         // 匹配正则，判断是否是中括号括起来的数据
//         let regExpTm = /^\[.+\]$/;
//         if (regExpTm.test(it)) {
//           it = it.split('[')[1].split(']')[0];
//         }
//         return it;
//       })
//       console.log('[endArr========]',endArr);
//       // 存入数据库中 --------------  【待完善-----】
//       // 【首先】根据teArr[9]token值找到对应的用户，然后存入到日志表中
//       // 注意去除token多余的双引号'"', teArr[9] = teArr[9].split('"')[1]
//       // Logs.create()
//     }
//   })
// }


// var te = new Date();
// var fileName = `logs/wwt-.${te.getFullYear()}-${te.getMonth()+1}-0${te.getDate()}.log`;
// getFileData(fileName);
// getLineFile(fileName);