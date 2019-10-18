// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router/routers'
import store from './store'
import api from './api'
import echarts from 'echarts'
import 'echarts/map/js/china'
import { getStore} from './utils/mUtils'
import Element from 'element-ui'
import NoNetwork from './components/network/index'
import 'element-ui/lib/theme-chalk/index.css'
import '../static/css/element-variables.scss'
import permission from './components/common/permission'
import moment from 'moment'

import '@/icons'  // 引入icons
import './router/index' // 全局守卫写在此处!!

// import axios from 'axios'
// Vue.prototype.$http = axios
Vue.prototype.$api = api;
Vue.config.productionTip = false;

Vue.use(Element);
// 挂载network断网组件
Vue.use(NoNetwork);
// 挂载指令v-permission
Vue.use(permission);

Vue.prototype.$echarts = echarts;
Vue.prototype.$moment = moment;


// console.log('---------main.js=================', store, getStore('menus'))

// 刷新时防止菜单空白，再次获取菜单
if (store.getters.token && getStore('menus')) {
  store.commit('ADD_MENU');
  store.dispatch('changeNetwork', false);
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
