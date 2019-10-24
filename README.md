# my-vue
> This is a Vue based back-end management system.  

****
	
|Author|窩窩头:panda_face:|
|---|---
|E-mail|hilaryha@qq.com


****
## 目录
* [版本说明](#版本说明)
* [文件说明](#文件说明)
* [项目环境](#项目环境)
* [功能说明](#功能说明)


*****
### 版本说明
-----
1. Node.js == v10.13.0
2. Npm == 6.10.3
3. Vue == 2.5.2
4. vue-router == 3.0.1

  
*****
### 文件说明
------
1. 【mongodbDatabase.zip】对应的数据库，具体导入、导出操作参考 [MongoDB之数据的备份、还原、导出、导入等简单操作](https://blog.csdn.net/weixin_42512937/article/details/102498644 "Mongodb数据库操作")
2. 【server】对应后端node（具体操作，在server文件下的readme.md文件中）
3. 【其他文件】对应Vue项目，运行以下命令，即可运行
> npm install   #安装所有需要的插件包  
npm run dev     #运行项目
4. 【注意运行顺序】 
   1. 先开启mongodb服务  `net start mongodb` (以管理身份打开cmd窗口)
   2. 然后运行node服务   `node app.js` (在server目录下的命令窗口执行)
   3. 最后执行Vue项目 `npm install` 、 `npm run dev` （在当前目录下执行）
  
  
*****
### 项目环境
-----
1. 由Vue + Node + Mongodb组成:  
  【前端】页面运用ElementUI组件和Vue进行展示  
  【数据库】选择的是非关系型数据库Mongodb  
  【后端】通过Node处理数据库与前端的交互  

2. 项目说明
  此项目属于后台管理系统类型，具有的主要功能如下：  
  - [ ] 登录（登录权限、生成token）
  - [ ] 菜单（通过对应角色分配）
  - [ ] 增删改查权限（通过对应角色分配）
  - [ ] 支付功能（使用沙箱环境）
  - [ ] 日志生成（利用log4js、Express和Node的结合）
  - [ ] TinyMCE富文本编辑器（主要有图片上传功能；保存、修改、查看编辑的文本）等

*****
### 功能说明
-----
1. **登录、注册**
   1. 前端：  
      1. 登录成功后，根据后端返回的token值，添加到请求头上"Content-Type"的Authorization字段中，使每次请求就会携带对应的token值 
      2. 注册功能呢，因为是后台管理系统，所以有一个用户管理页面，若有该页面的查询、新增功能，就可以添加用户（之后可能会加一个注册页面吧哈哈:beetle:）
   2. 后端： 
      1. 用户登录后会生成token，token的生成原理，封装检验token值的函数    
         * 通过openSSL工具生成私钥、公钥  
         * Node中引入中间件：fs（用于读取公钥、私钥文件），jsonwebtoken（跨域认证，利用sign函数生成token，然后verify函数验证token）
      2. 注册时加密密码原理：
         * Node中引入中间件：fs（用于读取公钥、私钥文件），crypto（提供通用的加密和哈希算法）  
         * 通过私钥加密、公钥解密的方式，参考 [Node.js+crypto模块之用户密码加密解密](https://blog.csdn.net/weixin_42512937/article/details/100739890)

2. **菜单**
   1. 前端：  
      * 首先是每个用户，会分配对应的角色，其中每个角色分配了，对应的菜单和增删改查的权限，所以给用户分配角色即可，角色可分配多个
   2. 后端：
      1. 用户登录时查找到对应用户userId / 登录之后通过获取用户token值（`/user/login`登录接口、`/menu/user`菜单接口）
         * 两个接口原理类似，根据用户userId去users_roles用户角色表，找到所有对应的角色roleId
         * 然后通过roleId去role_menu角色菜单表中找到对应的菜单数组（其中需要去重处理，因为多个角色中，对应的某些菜单选项可能相同）
   3. 逻辑参考 [后台管理项目之角色、权限、菜单、用户之间的关系（Vue+node.js+Mongodb）](https://blog.csdn.net/weixin_42512937/article/details/101106950 "菜单、权限、角色与用户之间的关系")

3. **权限（增删改查）**
   1. 前端：  
      * 类似菜单功能，首先是每个用户，会分配对应的角色，其中每个角色分配了，对应的菜单和增删改查的权限，所以给用户分配角色即可，角色可分配多个
   2. 后端：
      1. 用户登录时，查找到对应用户userId（`/user/login`登录接口返回）
         * 根据用户userId去users_roles用户角色表，找到所有对应的角色roleId
         * 然后通过roleId去role_permission角色权限表中找到对应的权限数组（其中需要去重处理，因为多个角色中，对应的某些权限选项可能相同）

4. **支付功能**
   1. 前端：  
      * 订单支付页面中，创建订单之后，打开后端返回的支付url，用自己的沙箱账号支付即可
   2. 后端：
      1. 创建订单（`/alipay`接口）
         * 根据前端订单数据，产生唯一订单号，结合支付宝提供的中间件“alipay-sdk”，注意使用自己的沙箱测试接口，沙箱appId等，最后调用exec函数，传递'alipay.trade.page.pay'支付接口，即可返回支付链接的 url地址
      2. 查询订单状态（`/alipay/:tradeNo`接口）
         * 根据订单号，调用exec函数，传递'alipay.trade.query'查询接口，此接口返回的https的url，需要结合request中间件，发送https请求，即可返回对应的状态值
   3. 实现步骤参考 [Vue node.js实现支付宝支付(沙箱测试)](https://blog.csdn.net/weixin_42512937/article/details/101108086 "支付宝沙箱支付")

5. **日志生成**
   1. 前端：  
      * 日志页面，可通过日期进行模糊查询，默认查询当天的日志（每一个请求都会生成一条日志）
   2. 后端：
      1. 引入的中间件
         * log4js（日志处理模块）
         * fs（操作文件）
         * readline（按行读取）
         * domain（处理异常）
      2. 封装日志生成文件log4.js，其中包含输出的日志文件格式、输入每条日志的格式（包含token值），然后导出在app.js文件中使用
      3. 日志列表根据日期获取对应的日志，此时是通过在读取之前，将数据库日志表清空，然后读取对应的日志文件，将日志文件按行读取，并且将每一行的格式（处理token、手动生成id值；因为mongodb数据库默认是_id），然后转换为与数据库字段格式对应的值，其中会存在读取到不存在的日期日志，就需要domain处理异常
      
   3. 参考 [Nodejs+Log4js日志的使用（环境：Vue+Node.js+Mongodb）](https://blog.csdn.net/weixin_42512937/article/details/102384942 "日志处理")

6. **TinyMCE富文本编辑器**
   1. 前端：  
      * 包含图片上传功能（有对应的图片列表，包含图片的查看、删除），富文本的保存、查看、编辑、删除功能
   2. 后端：
      1. 引入的中间件
         * fs（操作文件）
         * multer（上传图片）
      2. 通过multer定制图片存储的路径，调用了single单个图片上传函数
      3. 返回给前端图片展示的路径，需要用到Express的static中间件函数，用服务器地址+文件路径即可访问（如`app.use(express.static('./upload/'))`；表示upload目录下的css、图像、js文件都可访问，访问时省略upload即可；如访问`http://localhost:3000/tinymce/xxx.jpg`，表示访问的upload目录下的tinymce文件下的xxx.jpg图像）
         
   3. 参考[Vue+Node.js+TinyMCE富文本编辑器+express+multer图片上传](https://blog.csdn.net/weixin_42512937/article/details/102570051 "涉及上传图片，解析，存储路径；node接收formData数据；Express中提供静态文件等")


******

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run e2e tests
npm run e2e

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
