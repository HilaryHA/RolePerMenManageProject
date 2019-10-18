import store from '@/store'

/**
 * 检查是否有操作权限
 * @param {Array} value
 * @returns {boolean}
 */
export default function  checkPermission (value) {
  if ( value && Array.isArray(value) && value.length > 0 ) {
    // console.log(store);
    // 获取当前用户的权限值数组
    const roles = store.getters && store.getters.roles;

    // console.log(value, roles);

    // 该组件下对应的所有权限值数组
    const permissionRoles = value;
    let  hasPermission = roles && roles.some(role => { // 存在其中一个对应权限即可 根据不同用户获取不同权限
      return permissionRoles.includes(role); // 数组是否包含此元素
    })

    // console.log(hasPermission);
    // hasPermission = true; // 【测试】强行为true

    // 没有此角色权限时 返回false
    if (!hasPermission) {
      return false;
    }
    return true;
  } else {
    console.error(`This requires roles! Such as v-permission="['admin','editor','default']"`);
    return false;
  }
}
