/**
 *  @author Hilary
 *  @data  2019/05/04
 *  @version 1.0.0
 *  @parameter  封装axios，请求拦截、响应拦截、错误统一处理
 */
import axios from 'axios';
import router from '../router/routers';
import store from '../store';
import Element from 'element-ui';

/**
 *  提示函数 ---  此处有问题
 */
const tip = msg => {
    Element.Message({
        type: 'error',
        message: msg
    });
}

/**
 *  跳转登录页
 *  携带当前登录页路由，以便在登录页面完成登录后返回当前页面
 */
const toLogin = () => {
    // console.log(router)
    // console.log(router.history.current.path)
    if (router.history.current.path.includes('/')) {
        router.replace({ path: '/' });
    } else {
        router.replace({
            path: '/login',
            query: {
                redirect: router.currentRoute.fullPath
            }
        });
    }    
}

/**
 *  请求失败后的错误统一处理
 *  @param {Number} status 请求失败的状态码
 */
const errorHandle = (status, other) => {
//   console.log(status , other)
    // 状态码判断
    switch(status) {
        // 200: 后台返回错误信息
        case 200:
           if (other.includes('expired')) {
               tip('登录超时，请重新登录');
               toLogin();
           } else {
               tip(other);
           }
           break;
        // 401: 未登录状态，跳转登录页
        case 401:
            toLogin();
            break;
        // 403：token过期
        // 清除token并跳转登录页
        case 403:
            tip('登录过期，请重新登录');
            //---------vuex里存储loginSuccess和清除localStorage的token
            setTimeout(() => {
                toLogin();
            }, 1000);
            break;
        // 404: 请求不存在
        case 404:
            tip('请求的资源不存在');
            break;
        //----------其他状态码
        default:
            console.log(status, other);
    }
}

/**
 * 创建axios实例
 * @type {AxiosInstance}
 */
let instance = axios.create({
  timeout: 1000 * 12,
  withCredentials: true, // 允许跨域携带cookie信息
  headers: {  // 清除IE缓存
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
});

/**
 * 设置post请求的与实体对应的MIME信息
 * @type {string}
 */
instance.defaults.headers.post['Content-Type'] = 'application/json';
// instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

/**
 *  请求拦截器
 *  每次请求前，若存在token，则在请求头中携带token
 */
instance.interceptors.request.use(
    config => {
        // 登录流程控制中，根据本地是否存在token判断用户的登录情况
        // 但是即使token存在，也有可能token是过期的，所以在每次的请求头中携带token
        // 后台根据携带的token判断用户的登录情况，并返回给我们对应的状态码
        // 而后我们可以在响应拦截器中，根据状态码进行一些统一的操作。
        //-------------------
        // console.log('-------------------token-----------');
        // console.log(store.state.user.token);
        
        // 未完成功能-------*********------后端设置token值，一般返回的是一串字符串，参考https://juejin.im/post/5bab739af265da0aa3593177#heading-2
        // 接口除了登录，都通过token值进行获取对应的数据
        const token = JSON.stringify(store.state.user.token);
        // const token = store.state.user.token;
        
        token && (config.headers.Authorization = token);
        config.headers.Accept = "application/json, text/plain, */*";  // 指定客户端能够接收的内容类型
        return config;
    },
    error => Promise.reject(error)
)

// 响应拦截器
instance.interceptors.response.use(
    // 请求成功
    res => {
      if(res.status === 200) {
        if ( res.data.status == -1 ) {
          errorHandle(res.status, res.data.info);
        }
        Promise.resolve(res);
      } else {
        Promise.reject(res);
      }
      return res; // 打印为undefined，因为此处未return
    },
    // 请求失败
    error => {
        const { response } = error; //即error.response的值赋值给变量response
        console.log('================');
        console.info(response, error);
      if (response) {
            // 请求已发出，但是不在2xx的范围
            errorHandle(response.status, response.data.info);
            return Promise.reject(response);
        } else {
            // 处理断网的情况，或者[跨域]时获取不到状态值
            // eg:请求超时或断网时，更新state的network状态
            // network状态在app.vue中控制着一个全局的断网提示组件的显示隐藏
            store.dispatch('changeNetwork', true);
            console.info(`${error.name} : ${error.message}`);
            console.log('---------http.js=================', store.state)
        }
    }
)

export default instance;
