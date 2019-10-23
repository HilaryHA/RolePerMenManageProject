# server
> This is the backend code:leaves:
> 【注意】 所有node需要安装的包，都在my-vue文件夹下安装了，  
   即只需在my-vue目录下执行npm install即可.  

****
## 目录
* [文件说明](#文件说明)
* [备注事项](#备注事项)



*****
### 文件说明
------
1. 【config】 对应的私钥和公钥
  > rsa-xxx.pem 用户密码加密需要的秘钥
  > private.pem、public.pem 用户生成token需要的秘钥
  > [alipary_key] 沙箱支付需要的秘钥
2. 【logs】 对应生成的日志表
3. 【models】 连接数据库对应的文件
  > tableSchema.js 连接数据表、导出对应的数据表模型（db.js文件引入了）
  > log4.js 封装生成日志表的函数（app.js文件引入了）
  > db.js 连接数据库，引用了mongoose模块（app.js文件引入了）
4. 【router】 所有接口文件
5. 【upload】 图片上传保存在，此目录下的tinymce文件夹下（app.js中通过Express.static引用了此目录下的静态文件）
6. 【util】 封装自定义函数，如生成token、验证token、密码加密、密码解密、数组去重（基本类型与引用类型）等
7. 【app.js】 启动服务文件
  > `node app.js` 即可启动
  > 引入中间件`body-parser`，接收application/json格式的数据  
  > 引入中间件`cors`，解决跨域问题
  > 引入、使用接口路由
  > 启动服务器端口3000（通过`http://localhost:3000`访问）


*****
### 备注事项
------
1. **数据库使用的mongodb**  
   1. 安装软件： 需要安装Robo 3T可视化软件，便于操作数据库  
   2. 数据库名： myUser  
   3. 数据表名：  
      1. alipay 支付表
      2. dept 部门表
      3. dict 状态表
      4. dict_detail 状态细节表
      5. idol 爱豆表
      6. log 日志表
      7. menus 菜单表 （返回给前端的数据中，需要包含children字段）
      8. permission 权限表（返回给前端的数据中，不需要children字段，与菜单表的小区别哈）
      9. role 角色表
      10. role_menu 角色菜单表
      11. role_perimission 角色权限表
      12. temp_menu 临时菜单表（只包含菜单表中的子元素）
      13. temp_perm 临时权限表（只包含权限表中的子元素）
      14. test 测试表（可忽略）
      15. user_image 图片表（存储图片路径、名字等）
      16. uesr_tinymce 富文本文档表
      17. users 用户表
      18. users_roles 用户角色表
   
2. **使用工具OpenSSL生成秘钥**  
   1. 参考[RSA非对称加密算法](https://blog.csdn.net/weixin_42512937/article/details/100739890 "搜索openssl快速定位")  
   2. 一般先生成一个key文件，通过key文件生成私钥，然后公钥根据对应的秘钥生成  
      > openssl genrsa -out private.pem 2048        #生成私钥，2048应该是文件长度
      > openssl rsa -in private.pem -pubout -out public.pem   #根据私钥rsa_private_key.pem生成公钥
 
3. **生成token时，遇到的问题**
   1. 使用中间件 jsonwebtoken
      > 需要安装 `npm install jsonwebtoken --save-dev`
   2. 问题描述： 无效token、无效algorithm等（验证token值时报错）
   3. 问题原因： 原来！是一个双引号的问题，node获取请求头的authorization的值时，返回的值时"xxxxx"，但是只要xxxx
   4. 解决思路： 所以！去掉双引号即可验证成功，下次先看返回的值、传递的参数值等 ==_==` 
   
5. **图片删除问题**  
   1. 删除接口： "/picture/:_id"
   2. 删除思路：根据图片的“_id”删除图片表中数据，通过删除后返回的值中，获取对应的文件路径，删除对应的文件即可
   3. 问题描述：路径出错
   4. 问题原因：使用了相对路径
   5. 解决思路：引入中间件fs，使用的fs.unlinkSync函数，传递的参数需要使用绝对路径 
   
4. **图片上传问题**
   1. 上传接口： "/tinymceDocu/addPicture"
   2. 上传思路：根据图片的“_id”删除图片表中数据，通过删除后返回的值中，获取对应的文件路径，删除对应的文件即可
   3. 问题描述：路径出错
   4. 问题原因：使用了相对路径
   5. 解决思路：引入中间件fs，使用的fs.unlinkSync函数，传递的参数需要使用绝对路径
   
5. **图片删除问题**  
   1. 删除接口： "/tinymceDocu/picture/:_id"
   2. 删除思路：根据中间件multer，自定义存储图片的路径，然后调用上传单个文件single函数，上传成功后，返回给用户图片在服务器的路径等
   3. 问题描述：读取FormData类型数据错误
   4. 问题原因：使用single函数时，传参错误！参数名随意写的（哈哈，不错才怪:new_moon_with_face:）
   5. 解决思路：因为前端定义FormData对象时，命名为"file"，所以single对应想参数也应该是"file"，即参数名与前端存储FormData的对象名要一致

6. **用户多角色问题**
   1. 问题描述：用户添加了多个角色之后，登录之后，对应的菜单和权限，都只是第一个角色对应的值
   2. 问题原因：数据处理问题，只存储了查询后数据的第一个元素，应该遍历查询数组，不够严谨
   3. 解决思路：将多个角色获取的数据，都存储下来，不够此时有新的问题，即会出现重复的数据，所以，注意去重（注意数组的元素是引用数据类型）
   
   
