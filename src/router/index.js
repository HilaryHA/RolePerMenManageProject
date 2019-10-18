import router from './routers'
import store from '@/store'
import Config from '@/config'

/**
 * 全局守卫，路由菜单加载---判断是否有用户信息
 */
router.beforeEach((to, from, next) => {
  // console.log('-【全局守卫】---------to----index----', to, store.getters, router)
  if (to.name) {
    document.title = `${to.name} - ${Config.webName}`
  }
  // 若是首页，清空缓存
  if (to.path === '/') {
    store.dispatch('removeMenu');
    store.commit('LOGIN_OUT');
  }
  /* 未登录，不在首页，跳转到登录页 */
  if (!store.getters.token && to.path !== '/') {
    next({ path: '/' })
  } else {
    /* 已登录 */
    next();
  }
  next();
})
