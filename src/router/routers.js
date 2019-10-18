import Vue from 'vue'
import Router from 'vue-router'
// import HelloWorld from '@/components/HelloWorld'
// import Login from '@/components/login'
// import Home from '@/components/pages/home'
// import Index from '@/components/pages/index'
// import myForm from '@/components/pages/teForm'
// import myChart from '@/components/pages/teChart'
// import perRole from '@/components/pages/teRole'
// import perMenu from '@/components/pages/teMenu'
// import edEdit from '@/components/pages/teEdit'
// import edTable from '@/components/pages/teTable'


Vue.use(Router)

const routes = [
  {
    path: '/',
    name: '登录',
    components: require('@/components/login.vue'),
    hidden: true
  },
  {
    path: '/refresh',
    name: '刷新',
    components: require('@/components/refresh'),
    hidden: true
  }
]

export default new Router({
  mode: 'history',
  routes
})

//初始注册组件
// export default new Router({
//   mode: 'history',
//   routes: [
//     {
//       path: '/',
//       name: 'Login',
//       components: Login,
//       hidden: true
//     },
//     {
//       path: '/refresh',
//       name: '刷新',
//       components: require('@/components/refresh'),
//       hidden: true
//     },
//     {
//       path: '/my',
//       name: '用户信息',
//       components: Home,
//       redirect: '/my/index',
//       svgIcon: '#iconyonghu',
//       children: [
//         { path: '/my/index', name: '首页', components: Index, svgIcon: '#iconyonghu' },
//         { path: '/my/myForm', name: '个人资料', components: myForm, svgIcon: '#iconbiaoge' },
//         { path: '/my/myChart', name: '图表信息', components: myChart, svgIcon: '#icontubiao' },
//       ]
//     },
//     {
//       path: '/per',
//       name: '权限管理',
//       components: Home,
//       svgIcon: '#iconxitongquanxian',
//       children: [
//         { path: '/per/role', name: '角色管理', components: perRole, svgIcon: '#iconjiaoseguanli' },
//         { path: '/per/menu', name: '菜单管理', components: perMenu, svgIcon: '#iconcaidan' }
//       ]
//     },
//     {
//       path: '/ed',
//       name: '编辑信息',
//       components: Home,
//       svgIcon: '#iconedit',
//       children: [
//         { path: '/ed/edEdit', name: '编辑新闻', components: edEdit, svgIcon: '#iconfuwenbenkuang' },
//         { path: '/ed/edTable', name: '展示信息', components: edTable, svgIcon: '#iconzhanshi' }
//       ]
//     }
//   ]
// })
