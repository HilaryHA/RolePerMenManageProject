const types = {
  LOGIN_STATUS: 'LOGIN_STATUS',    // 是否登录
  USER_TOKEN: 'USER_TOKEN',         // 用户token信息
  CHANGE_NETWORK: 'CHANGE_NETWORK', // 改变是否显示断网组件
  SET_ROLES: 'SET_ROLES',           // 设置角色权限
  SET_USER: 'SET_USER',             // 设置用户信息
  LOGIN_IN: 'LOGIN_IN',             // 登录成功
  LOGIN_OUT: 'LOGIN_OUT',           // 退出登录
  EDIT_TINYMCE: 'EDIT_TINYMCE'      // 编辑文档信息
}

const state = {
  loginSuccess: false,
  token: "",
  network: false,
  roles: [],   // 所有权限值
  user: {},
  tinymceInfo: {}
}

const getters = {
  loginSuccess: state => state.loginSuccess,
  token: state => state.token,
  network: state => state.network,
  roles: state => state.roles,
  user: state => state.user,
  tinymceInfo: state => state.tinymceInfo
}

const mutations = {
  [types.LOGIN_STATUS](state, logStatus) {
    state.loginSuccess = logStatus;
  },
  [types.USER_TOKEN](state, content) {
    state.token = content;
  },
  [types.CHANGE_NETWORK](state, netStatus) {
    state.network = netStatus;
  },
  [types.SET_ROLES]: (state, roles) => {
    state.roles = roles;
  },
  [types.SET_USER]: (state, user) => {
    state.user = user;
  },
  [types.LOGIN_IN]: (state, data) => {
    state.user = data.userInfo;
    state.roles = data.menuAndPerm[1];
    state.token = data.userInfo.token;

  },
  [types.LOGIN_OUT]: (state) => {
    state.loginSuccess = false;
    state.token = null;
    state.roles = null;
    state.user = null;
    state.network = false;
    state.tinymceInfo = null;
  },
  [types.EDIT_TINYMCE]: (state, objInfo) => {
    state.tinymceInfo = objInfo;
  }
}

const actions = {
  loginSuccess: ({ commit }, logStatus) => {
    commit(types.LOGIN_STATUS, logStatus);
  },
  userToken: ({ commit }, content) => {
    commit(types.USER_TOKEN, content);
  },
  changeNetwork: ({ commit }, netStatus) => {
    commit(types.CHANGE_NETWORK, netStatus);
  },
  setUser: ({ commit }, user) => {
    commit(types.SET_USER, user);
  },
  setRoles: ({ commit }, data) => {
    setRoleInfo(data, commit);
  },
  loginIn: ({ commit }, data) => {
    // console.log('----------------->',dispatch);

    commit(types.LOGIN_IN, data);
    // // commit(types.USER_TOKEN, token);
    // dispatch('userToken'); // 调用了吗？
    // dispatch('Menu/addMenu', {},  {root: true}); // 调用菜单模块中的方法
    // dispatch('setRoles', roleData)
  },
  loginOut: ({ commit }) => {
    commit(types.LOGIN_OUT);
  },
  editInymce: ({ commit }, objInfo) => {
    commit(types.EDIT_TINYMCE, objInfo);
  }
}

export const setRoleInfo = (roles, commit) => {
  // console.log('------------------roles--------------', roles);
  // 如果没有任何权限，则赋予一个默认的权限，避免请求死循环
  if (!roles || roles.length == 0) {
    commit('SET_ROLES', ['ROLE_SYSTEM_DEFAULT']);
  } else {
    roles = roles.map(ro => {
      return ro.name;
    })
    commit('SET_ROLES', roles);
  }
}

export default {
  // namespaced: true,   // 模块化管理，命名空间的开启,有问题
  state,
  getters,
  mutations,
  actions
}
