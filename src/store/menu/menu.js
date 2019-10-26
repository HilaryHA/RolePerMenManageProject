import { getMenus, setStore, removeStore } from '../../utils/mUtils';
import router from '../../router/routers'

const types = {
    ADD_MENU : 'ADD_MENU',     // 加载菜单
    REMOVE_MENU : 'REMOVE_MENU',  // 清空菜单
    GET_MENU_LIST : 'GET_MENU_LIST'  // 获取菜单
}

const state = {
    menus : []
}

const getters = {
    menus: state => state.menus
}

const mutations = {
    async [types.ADD_MENU] (state, content) {
        // 调用异步函数 -- 从后端获取菜单
        let teMenus = [];
        // 登录页获取的数据
        if (content && content.length > 0) {
            teMenus= await getMenus(content);
        } else {
            // 刷新时重新获取数据
            teMenus= await getMenus();
        }        
        if ( teMenus.length == 0 ) {
          state.menus = [];
        } else {
          let noFound = [{
            path: '/401',
            name: '401',
            component: resolve => (require(['../../components/common/401/index.vue'], resolve)),
            hidden: true
          },{
            path: '*',
            name: '404',
            component: resolve => (require(['../../components/notFound.vue'], resolve)),
            hidden: true
          }];
          state.menus = teMenus.concat(noFound);  //将404组件添加到当前菜单
          setStore('menus',state.menus);          //存储菜单信息到本地
          router.addRoutes(state.menus);          //动态注册组件
        }
    },
    [types.REMOVE_MENU] (state) {
        state.menus = [];
        removeStore('menus');
    }
}

const actions = {
    addMenu: ({ commit }, content) => {
        commit(types.ADD_MENU, content);
    },
    removeMenu: ({ commit }) => {
        commit(types.REMOVE_MENU)
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}
