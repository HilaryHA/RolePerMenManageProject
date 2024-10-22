# RolePerMenManageProject
> This is a background management project that includes roles, permissions, menus, and users.     
> 这是包含角色、权限、菜单、用户的后台管理项目.      

****
	
|Author|窩窩头:panda_face:|
|---|---
|E-mail|hilarywwtha@gmail.com


****
## 目录
* [项目环境](#项目环境)
* [版本说明](#版本说明)
* [文件说明](#文件说明)
* [功能说明](#功能说明)
* [备注说明](#备注说明)
* [项目展示图](#项目展示图)

  
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
### 版本说明
-----
1. Node.js == v10.13.0
2. Npm == 6.10.3
3. Vue == 2.5.2
4. vue-router == 3.0.1
5. element-ui == ^2.12.0

  
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


*****
### 备注说明
-----
1. **设置history模式，默认是hash模式**  
    1. 此模式，需要后端配合设置
        * router文件夹>index.js文件:  
        * ```javascript
                export default new Router({
                        mode: 'history',
                        routes:[{...}]
                })
          ```  

2. **将访问地址localhost改为可以ip地址访问**  
    1. config文件夹>index.js文件：
    2. ```javascript
                module.exports = {
                    dev: {
                        ...
                        host: '0.0.0.0', 		       // 可以通过http://localhost:8080或http://ip值:8080进行访问
                        port: 8080				         // 端口号
                        autoOpenBrowser: true,	   // npm run dev后自动打开浏览器
                        ...
                    }
                }
       ```  

3. **组件注册的几种写法**  
    1. `{ path: '/login', name: 'login', component: Login }` 需要文件引入对应组件，如`import Login from '@/components/login'`
    2. `{ path: '/login', name: 'login', component: () => import('@/components/login.vue') }`
    3. `{ path: '/login', name: 'login', component: require('@/components/login.vue').default }`
    4. `{ path: '/login', name: 'login', components: require('@/components/login.vue') }`  
 
4. **axios请求方法封装、请求接口文件的封装**  
    1. 自定义函数在util文件夹下，http.js文件封装了axios请求
       >  封装http.js文件中  
          注意：request请求时，在请求头带上token值， 
          response响应时，接收错误状态码的值，当跨域问题出现时，接收不到错误状态码  
       
    2. api文件夹里面
       * 包含index.js（管理统一接口）  
       * base.js（管理多个接口域名）  
       * otherApi文件夹（内部如user.js，即专门写用户模块的接口）  

5. **需要存储到本地的数据，通过Vuex中的store存储**  
    1. 存储的信息有：
       * 用户登录信息、  
       * 路由菜单信息menus、  
       * 权限信息roles、  
       * 断网状态、  
       * token是否过期等  
       
    2. 避免store数据刷新丢失问题，安装插件`vuex-persistedstate`可解决
       * `npm install vuex-persistedstate --save-dev`  # 此插件默认将数据存储在localStorage中  
       * store中关键代码（/src/store/index.js）：
       * ```javascript
                export default new Vuex.Store({
                       modules: {
                              menu,
                              ....
                       },
                       plugins: [createPersistedState()]        // 默认存储于localStorage
                })
         ```  

  
6. **解决跨域问题**  
    1. 后端解决：本项目是后端（node.js）处理的
       * 安装cors中间件 `npm install cors --save` # my-vue目录下安装cors包即可  
       * 如下（/server/app.js中）：
       * ```javascript
                  // 引入cors包
                  var cors = require('cors');
                  // 解决跨域问题
                  app.use(cors({
                           origin: ['http://localhost:8099'], // 允许此域名访问
                           methods: ['GET','POST'], // 只允许get和post请求
                           alloweHeaders: ['Content-Type', 'Authorization'] // 只允许带这两种请求头的链接访问
                  }));
         ```  
       * 前端可直接调用接口`http://localhost:3000/menu`访问（端口号不同，也是跨域）
                  
    2. 前端解决：my-vue目录下的config > index.js
       * 配置proxy代理：
       * ```javascript
                  proxyTable: {
                            //代理
                            "/api": {
                                 target: "http://localhost:3000",  // 接口的域名
                                 pathRewrite: {
                                   "^/api": "http://localhost:3000"     // 需要将/api重写为''
                                 },
                                 secure: false,    // 如果是https接口，需要配置这个参数
                                 changeOrigin: true// 如果接口跨域，需要进行这个参数配置
                            }
                  } 
          ```  
       * 调用接口`http://localhost:3000/menu`访问，请求方法中接口地址直接写`/api/menu`即可
                  

7. **Vue打包后浏览器检查(f12)能看到源码问题**  
    1. 修改config的index.js文件，将productionSourceMap设置为false

8. **前端权限控制，两种方式**
    1. 自定义指令v-permission，参数为该组件对应的可显示权限数组值
       * 如：`v-permission="['ADMIN','PERMISSION_ALL', 'PERMISSION_EDIT']"`
    2. 通过检验函数checkPermission，参数为该组件对应的可显示权限数组值
       * 如：`v-if="checkPermission(['ADMIN','PERMISSION_ALL', 'PERMISSION_EDIT', 'PERMISSION_DELETE'])"`    

9. **全局守卫问题**
    1. 全局守卫写在了roter文件下的index.js文件中，因为一般直接写在main.js，我把它单独抽了出来，还给忘记啦哈哈
    2. 具体参考 [Vue动态路由、菜单（解决了刷新菜单空白问题） 全局前置守卫](https://blog.csdn.net/weixin_42512937/article/details/100778840 "动态路由、全局守卫")


*****
### 项目展示图
-----

|展示图|
|---
|![image](https://github.com/HilaryHA/my-vue/blob/master/static/img/showGif/1_0.gif)
|![image](https://github.com/HilaryHA/my-vue/blob/master/static/img/showGif/1_1.gif)
|![image](https://github.com/HilaryHA/my-vue/blob/master/static/img/showGif/1_2.gif)
|![image](https://github.com/HilaryHA/my-vue/blob/master/static/img/showGif/1_3.gif)
|![image](https://github.com/HilaryHA/my-vue/blob/master/static/img/showGif/1_4.gif)
|![image](https://github.com/HilaryHA/my-vue/blob/master/static/img/showGif/1_5.gif)
|![image](https://github.com/HilaryHA/my-vue/blob/master/static/img/showGif/1_6.gif)
|![image](https://github.com/HilaryHA/my-vue/blob/master/static/img/showGif/1_7.gif)
|![image](https://github.com/HilaryHA/my-vue/blob/master/static/img/showGif/1_8.gif)




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
