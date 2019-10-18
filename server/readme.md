## 数据库使用的mongodb，需要安装Robo 3T可视化软件，便于操作数据库
## 数据库 myUser
## 数据表 dept、dict、dict_detail、menus、users
## menus  菜单表  需要显示在组件菜单中的，都需要包含children字段


### node.js利用OpenSSL生成秘钥和公钥，其中公钥需要根据对应的秘钥生成
### openssl genrsa -out private.pem 2048        生成私钥，2048应该是文件长度
### openssl rsa -in private.pem -pubout -out public.pem   根据私钥rsa_private_key.pem生成公钥


## 安装jsonwebtoken
###  npm install jsonwebtoken --save-dev
####    验证token值时报错： 无效token、无效algorithm等
####    原来，是一个双引号的问题，node获取请求头的authorization的值时，返回的值时"xxxxx"，但是只要xxxx
####    所以，去掉双引号即可验证成功，下次先看返回的值、传递的参数值等 ==_==`

## 图片删除问题
###     图片删除接口"/picture/:_id"，需要传递绝对路径
####    即文件"server\router\tinymceDocu.js"的173行，根据具体文件路径进行修改

## 上传图片文件FormData类型
###     需要安装中间件"multer"，然后使用单文件上传signle("xxx")，注意参数名与前端存储FormData的对象名一致

## 一个用户可以有多角色