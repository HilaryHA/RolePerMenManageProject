import Vue from 'vue'
import Vuex from 'vuex'
import menu from './menu'
import user from './user'
import createPersistedState from 'vuex-persistedstate'  // 此插件保证刷新时，不丢失数据

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        menu,
        user
    },
    plugins: [createPersistedState()] // 默认存储于localStorage
})
