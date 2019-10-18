import isNetwork from './isNetwork';

const whetherNoNetWork = {
    install: function(Vue) {
        Vue.component('no-network', isNetwork)
    }
};

export default whetherNoNetWork;