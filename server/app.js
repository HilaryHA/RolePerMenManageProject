/**
 * 启动express服务
 * @author Hilary
 * @date 2019/06/06
 */

//1. 引入express模块
const express = require('express');

//2. 引入body-parser才能拿到post的参数
const bodyParser = require('body-parser');

//3. 引入定义的接口路由
const user = require('./router/users');
const menu = require('./router/menus');
const dept = require('./router/dept');
const dictDetail = require('./router/dictDetail');
const permission = require('./router/permission');
const role = require('./router/role');
const alipay = require('./router/alipay');
const idol = require('./router/idol');
const logs = require('./router/logs');
const tinymceDocu = require('./router/tinymceDocu');

// 4. 引入cors包
var cors = require('cors');

// 5 .创建app对象
const app = express();

const { use } = require("./models/log4");
use(app, 'info');

// 【注意】upload文件夹与/router/tinymceDocu.js使用的静态文件夹路径(相对于app.js的路径)一致
app.use(express.static('./upload/'));

// 解决post接口获取为正常的application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 解决跨域问题
app.use(cors({
  origin: ['http://192.168.7.12:8099', 'http://localhost:8099'],  // 允许指定域名访问
  methods: ['GET', 'POST', 'PUT', 'DELETE'],                      // 允许指定请求方式
  alloweHeaders: ['Content-Type', 'Authorization'],               // 只允许带这两种请求头的链接访问
  credentials: true                                               // 允许跨域携带cookie值
}));

// 使用接口/路由
app.use('/user', user);
app.use('/menu', menu);
app.use('/dept', dept);
app.use('/dictDetail', dictDetail);
app.use('/permission', permission);
app.use('/role', role);
app.use('/alipay', alipay);
app.use('/idol', idol);
app.use('/logs', logs);
app.use('/tinymceDocu', tinymceDocu);
app.use('/', (req, res) => {
  res.send('Oh you are success!!')
});

// 定义服务启动端口
app.listen(3000, () => {
  console.log('app listening on port 3000')
})



























