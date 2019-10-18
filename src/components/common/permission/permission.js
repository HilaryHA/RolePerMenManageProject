import store from '@/store'

/**
 * 检查单个操作按钮权限
 */
export default {
  // 被绑定元素插入父节点时调用(仅保证父节点存在，但不一定已被插入文档中)
  inserted(el, binding, vnode) {
    // 获取自定义指令'v-permission'传递的参数，即对应的权限数组
    const { value } = binding
    const roles = store.getters && store.getters.roles
    // console.table(binding);
    // console.log(`roles----------------->${roles}====================> ${value}`);
    if ( value && value instanceof Array && value.length > 0 ) {
      // 该组件需要对应的某个权限值（包含数组的某个权限值，都可以显示该组件）
      const permissionRoles = value

      let hasPermission = roles && roles.some(item => {
        return permissionRoles.includes(item)
      })

      // console.log(hasPermission);
      // hasPermission = true; // 【测试】强行为true

      // 没有此角色权限时 移除该DOM节点，达到没有权限，则不限此操作
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error( `This requires roles! Such as v-permission="['admin','editor','default']"`)
    }

  }
}
