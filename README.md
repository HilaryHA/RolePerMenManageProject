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
1. **登录**
   1. 前端：  
      * 登录成功后，根据后端返回的token值，添加到请求头上"Content-Type"的Authorization字段中，使每次请求就会携带对应的token值   
   2. 后端： 
      1. 封装检验token值的函数，token的生成原理    
         * 通过openSSL工具生成私钥、公钥  
         * Node中引入中间件：fs（用于读取公钥、私钥文件），jsonwebtoken（跨域认证，利用sign函数生成token，然后verify函数验证token）
      2. 注册时加密密码原理：
         * Node中引入中间件：fs（用于读取公钥、私钥文件），crypto（提供通用的加密和哈希算法）  
         * 通过私钥加密、公钥解密的方式，参考[Node.js+crypto模块之用户密码加密解密](https://blog.csdn.net/weixin_42512937/article/details/100739890)

2. **菜单**
登录

3. **增删改查权限**
登录

4. **支付功能**
登录

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
