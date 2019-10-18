// 定义数据表

//引入mongoose模块
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

/**
 * 定义数据模型，下面创建了一个表，表中的数据有name、password等字段，并且这些字段的数据类型也定义了，最后将model导出即可
 * 这里mongoose.Schema 第二个参数，明确指定到数据库中的哪个表取数据，如传递users，目的就是为了以后操作数据要去users表中。
 * 指定数据库中表，并定义相应的字段
 * @param obj 字段对象
 * @param schemaName 表名
 * @returns {mongoose.Schema}
 */
function connectionTable(obj, schemaName) {
  return new mongoose.Schema(obj, { collection: schemaName })
}
// const userSchema = new mongoose.Schema(obj, { collection: schemaName })
// 用户信息
const userSchema = connectionTable({
  id: Number,
  name: {
    type: String,
    trim: true  // 预定义修饰符：去除前后空字符串
  },
  password: String,
  token: {
    type: String,
    default: ''
  },
  alias: {
    type: String,
    default: ''
  },
  create_time: {
    type: Date,
    default: Date.now
  },
  update_time: {
    type: Date,
    default: Date.now
  }
}, "users");

// 菜单数据
const menuSchema = connectionTable({
  id: Number,
  path: String,
  name: String,
  label: String,
  components: String,
  redirect: String,
  svgIcon: String,
  children: Array,
  create_time: {
    type: Date,
    default: Date.now
  },
  update_time: {
    type: Date,
    default: Date.now
  }
}, "menus");

// 部门数据
const deptSchema = connectionTable({
  id: Number,
  name: String,
  label: String,
  pid: Number,
  create_time: {
    type: Date,
    default: Date.now // 默认当前时间
  },
  update_time: {
    type: Date,
    default: Date.now
  },
  enabled: Boolean,
  children: Array  // 注意此字段在数据库不存在
}, 'dept');

// 数据字典
const dictSchema = connectionTable({
  id: Number,
  name: String,
  remark: String
}, 'dict');

// 数据字典详情
const dictDetailSchema = connectionTable({
  id: Number,
  label: String,
  value: Boolean,
  sort: Number,
  dict_id: Number
}, 'dict_detail');

// 权限数据
const permissionSchema = connectionTable({
  id: Number,
  alias: String,
  name: String,
  label: String,
  pid: Number,
  children: Array,
  create_time: {
    type: Date,
    default: Date.now
  },
  update_time: {
    type: Date,
    default: Date.now
  }
}, 'permission')

// 角色数据
const roleSchema = connectionTable({
  id: Number,
  name: String,
  describe: String,
  level: Number,
  data_perm: String,
  create_time: {
    type: Date,
    default: Date.now
  },
  update_time: {
    type: Date,
    default: Date.now
  }
}, 'role')


// 用户角色表
const usersRolesSchema = connectionTable({
  user_id: Number,
  role_id: Number,
  inventory_menu: Array,
  menu_detail: Array,
  inventory_permission: Array,
  permission_detail: Array
}, 'users_roles')

// 角色菜单表
const roleMenuSchema = connectionTable({
  menu_id: Number,
  role_id: Number
}, 'role_menu')

// 角色权限表
const rolePermissionSchema = connectionTable({
  permission_id: Number,
  role_id: Number
}, 'role_permission')

// 临时菜单表
const tempMenuSchema = connectionTable({
  _id: Number,
  menu: []
}, 'temp_menu')

// 临时权限表
const tempPermSchema = connectionTable({
  _id: Number,
  perm: []
}, 'temp_perm')

// 支付表
const alipaySchema = connectionTable({
  _id: String,
  orderId: String,
  name: String,
  price: {
    type: Number,
    default: 45
  },
  fruitApple: {
    type: Number,
    default: 1
  },
  fruitMango: {
    type: Number,
    default: 1
  },
  fruitDragonFruit: {
    type: Number,
    default: 1
  },
  fruitOrange: {
    type: Number,
    default: 1
  },
  remarks: String,
  create_time: {
    type: Date,
    default: Date.now
  },
  update_time: {
    type: Date,
    default: Date.now
  }
}, 'alipay')

// 爱豆表
const idolSchema = connectionTable({
  id: String,
  name: String,
  birthplace: String,
  dateOfBirth: String,
  height: String,
  constellation: String,
  description: String
}, 'idol')

// 日志表
const logSchema = connectionTable({
  id: Number,
  name: String,
  detail: String,
  address: String,
  create_time: {
    type: Date,
    default: Date.now
  },
  update_time: {
    type: Date,
    default: Date.now
  }
}, 'log')

// 上传图片表
const uploadImgSchema = connectionTable({
  last_modified_user_id : Number,
  name : String,
  originalname : String,
  priview_url : String,
  encoding : String,
  suffix_name : String,
  size : Number,
  create_time : {
    type: Date,
    default: Date.now
  },
  update_time : {
    type: Date,
    default: Date.now
  }
}, 'user_image')

// 文档表
const docuTinymceSchema = connectionTable({
  last_modified_user_id : Number,
  html_text : String,  
  title : String,
  create_time : {
    type: Date,
    defaule: Date.now
  },
  update_time : {
    type: Date,
    defaule: Date.now
  }
}, 'user_tinymce')


exports.Users = mongoose.model('users', userSchema);
exports.Menus = mongoose.model('menus', menuSchema);
exports.Dept = mongoose.model('dept', deptSchema);
exports.Dict = mongoose.model('dict', dictSchema);
exports.DictDetail = mongoose.model('dict_detail', dictDetailSchema);
exports.Permission = mongoose.model('permission', permissionSchema);
exports.Role = mongoose.model('role', roleSchema);
exports.UsersRoles = mongoose.model('users_roles', usersRolesSchema);
exports.RoleMenu = mongoose.model('role_menu', roleMenuSchema);
exports.RolePermission = mongoose.model('role_permission', rolePermissionSchema);
exports.TempMenu = mongoose.model('temp_menu', tempMenuSchema);
exports.TempPerm = mongoose.model('temp_perm', tempPermSchema);
exports.Alipay = mongoose.model('alipay', alipaySchema);
exports.Idol = mongoose.model('idol', idolSchema);
exports.Logs = mongoose.model('log', logSchema);
exports.UploadImg = mongoose.model('user_image', uploadImgSchema);
exports.DocuTinymce = mongoose.model('user_tinymce', docuTinymceSchema);