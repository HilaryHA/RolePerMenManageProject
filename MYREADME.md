### 跨域问题
   本项目是后端（node.js）处理

### 权限控制，两种方式
    1` 自定义指令v-permission，参数为该组件对应的可显示权限数组值
       如：v-permission="['ADMIN','PERMISSION_ALL', 'PERMISSION_EDIT']"
    2` 通过检验函数checkPermission，参数为该组件对应的可显示权限数组值
       如：v-if="checkPermission(['ADMIN','PERMISSION_ALL', 'PERMISSION_EDIT', 'PERMISSION_DELETE'])"

### 自己坑自己
   1` 全局守卫写在了roter文件下的index.js文件中，因为一般直接写在main.js，我把它单独抽了出来，还给忘记啦哈哈
