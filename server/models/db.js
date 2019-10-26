/**
 * 连接数据库
 * @author Hilary
 * @data 2019/06/06
 */

// 引入mongoose模块
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
// 引入数据表
const tableSchema = require('./tableSchema');

/**
 * 数据库地址
 * Connecting to Mongod instance.
 */
const dbHost = 'mongodb://localhost/myUser';


/**
 * 连接mongodb数据库
 * @param {参数1} 'mongodb数据库启动的地址'
 * @param {参数2} 'parser过时，调用新的解析方法'
 * @param {参数3} '回调函数，用于判断是否连接成功'
 */
mongoose.connect(
    dbHost,
    {
        useNewUrlParser: true
    },
    err => {
        if (err) console.log("**********【数据库连接失败】**********" + err);
        else console.log("**********【数据库连接成功】**********");
    });


const db = mongoose.connection;
db.on('error', function () {
    console.error.bind(console, 'Database connection error HA');
})
db.once('open', function () {
    console.log('The Database has connected HA');
})

module.exports = tableSchema; // 导出数据表

//导出model模块
// const Users = module.exports = mongoose.model('users', userSchema);
