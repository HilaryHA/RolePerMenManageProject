# my-vue
> This is a Vue based back-end management system.  

****
	
|Author|窩窩头|
|---|---
|E-mail|719955128@qq.com


****
## 目录
* [文件说明](#文件说明)
* [项目环境](#项目环境)
* [功能说明](#功能说明)


=
### 文件说明
------
* 【mongodbDatabase.zip】对应的数据库，具体导入、导出操作参考[MongoDB之数据的备份、还原、导出、导入等简单操作](https://blog.csdn.net/weixin_42512937/article/details/102498644 "悬停显示")
* 【server】对应后端node（具体操作，在server文件下的readme.md文件中）
* 【其他文件】对应Vue项目，运行以下命令，即可运行（注意：在此之前需要先开启mongodb服务，然后运行node服务，最后执行以下命令即可）
> npm install  #安装所有需要的插件包  
npm run dev #运行项目
  
  
*****
### 项目环境
```
# 由Vue + Node + Mongodb组成
前端页面运用ElementUI组件和Vue进行展示，数据库选择的是非关系型数据库Mongodb，后端通过Node处理数据库与前端的交互

# 项目说明
属于后台管理系统系列，具有的功能，登录（登录权限）、菜单（通过对应角色分配）、增删改查权限（通过对应角色分配）、支付功能（使用沙箱环境）、日志生成（利用log4js、Express和Node的结合）、TinyMCE富文本编辑器（主要有图片上传功能；保存、修改、查看编辑的文本）等
```

*****
### 功能说明
```
## 登录
登录

## 菜单
登录

## 增删改查权限
登录

## 支付功能
登录

## 日志生成
登录

## TinyMCE富文本编辑器
登录
```

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
