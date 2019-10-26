/**
 * @author Hilary
 * @Date 2019/06/10
 * @parameter 定义全局断网组件
 */
import isNetwork from './isNetwork';

const whetherNoNetWork = {
    install: function (Vue) {
        Vue.component('no-network', isNetwork)
    }
};

export default whetherNoNetWork;