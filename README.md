# my-vue
> This is a Vue based back-end management system.  

****
	
|Author|窩窩头:panda_face:|
|---|---
|E-mail|719955128@qq.com


****
## 目录
* [文件说明](#文件说明)
* [项目环境](#项目环境)
* [功能说明](#功能说明)


*****
### 文件说明
------
1. 【mongodbDatabase.zip】对应的数据库，具体导入、导出操作参考[MongoDB之数据的备份、还原、导出、导入等简单操作](https://blog.csdn.net/weixin_42512937/article/details/102498644 "Mongodb数据库操作")
2. 【server】对应后端node（具体操作，在server文件下的readme.md文件中）
3. 【其他文件】对应Vue项目，运行以下命令，即可运行（注意：在此之前需要先开启mongodb服务，然后运行node服务，最后执行以下命令即可）
> npm install   #安装所有需要的插件包  
npm run dev     #运行项目
  
  
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
         * 通过私钥加密、公钥解密的方式，参考[Node.js+crypto模块之用户密码加密解密](https://blog.csdn.net/weixin_42512937/article/details/100739890)

2. **菜单**
   1. 前端：  
      * 首先是每个用户，会分配对应的角色，其中每个角色分配了，对应的菜单和增删改查的权限，所以给用户分配角色即可，角色可分配多个，其中逻辑参考[后台管理项目之角色、权限、菜单、用户之间的关系（Vue+node.js+Mongodb）](https://blog.csdn.net/weixin_42512937/article/details/101106950 "菜单、权限、角色与用户之间的关系")
   2. 后端：
      1. 用户登录时查找到对应用户userId / 登录之后通过获取用户token值（`/user/login`登录接口、`/menu/user`菜单接口）
         * 两个接口原理类似，根据用户userId去users_roles用户角色表，找到所有对应的角色roleId
         * 然后通过roleId去role_menu角色菜单表中找到对应的菜单数组（其中需要去重处理，因为多个角色中，对应的某些菜单选项可能相同）
      

3. **权限（增删改查）**
   1. 前端：  
      * 类似菜单功能，首先是每个用户，会分配对应的角色，其中每个角色分配了，对应的菜单和增删改查的权限，所以给用户分配角色即可，角色可分配多个
   2. 后端：
      1. 用户登录时，查找到对应用户userId（`/user/login`登录接口返回）
         * 根据用户userId去users_roles用户角色表，找到所有对应的角色roleId
         * 然后通过roleId去role_permission角色权限表中找到对应的权限数组（其中需要去重处理，因为多个角色中，对应的某些权限选项可能相同）


4. **支付功能**
   1. 前端：  
      * 支付
   2. 后端：
      1. bala

5. **日志生成**
登录

6. **TinyMCE富文本编辑器**
登录


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
