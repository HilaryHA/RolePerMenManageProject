/**
 *  @author Hilary
 *  @date  2019/05/04
 *  @version 1.0.0
 *  @parameter  公共函数
 */

import api from '@/api';
/**
 * 存储localStorage
 */
export const setStore = (name, content) => {
  if (!name) return
  if (typeof content !== 'string') {
    content = JSON.stringify(content)   //将 JavaScript 值转换为 JSON 字符串  `JSON.stringify(str, null, 4)` 表示使用四个空格缩进
  }
  window.localStorage.setItem(name, content)
}

/**
 * 获取localStorage
 */
export const getStore = name => {
  if (!name) return
  var value = window.localStorage.getItem(name)
  if (value !== null) {
    try {
      value = JSON.parse(value)   //将 JSON 字符串转换为对象
    } catch (e) {
      value = value
    }
  }
  return value
}

/**
 * 删除localStorage
 */
export const removeStore = name => {
  if (!name) return
  window.localStorage.removeItem(name)
}

/**
 * @param {date} 标准时间格式:Fri Nov 17 2017 09:26:23 GMT+0800 (中国标准时间)
 * @param {type} 类型
 *   type == 1 ---> "yyyy-mm-dd hh:MM:ss.fff"
 *   type == 2 ---> "yyyymmddhhMMss"
 *   type == 3 ---> "yyyy-mm-dd"
 *   type == '' ---> "yyyy-mm-dd hh:MM:ss"
 */
export const formatDate = (time, type) => {
  let date = '';
  if (time) {
    if (time instanceof Date) {
      date = time;
    } else {
      date = new Date(time);
    }
    var year = date.getFullYear();//年
    var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;//月
    var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();//日
    var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();//时
    var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();//分
    var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();//秒
    var milliseconds = date.getMilliseconds() < 10 ? "0" + date.getMilliseconds() : date.getMilliseconds() //毫秒
    if (type == 1) {
      return year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds + "." + milliseconds;
    } else if (type == 2) {
      return year + "" + month + "" + day + "" + hour + "" + minutes + "" + seconds;
    } else if (type == 3) {
      return year + "-" + month + "-" + day;
    } else {
      return year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds;
    }
  } else {
    return date;
  }
}

/**
 * 时间转换：20150101010101 --> '2015-01-01 01:01:01'
 */
export const parseToDate = (timeValue) => {
  var result = "";
  var year = timeValue.substr(0, 4);
  var month = timeValue.substr(4, 2);
  var date = timeValue.substr(6, 2);
  var hour = timeValue.substr(8, 2);
  var minute = timeValue.substr(10, 2);
  var second = timeValue.substr(12, 2);
  result = year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
  return result;
}

/**
 * 判断空值
 */
export const isEmpty = (keys) => {
  if (typeof keys === "string") {
    keys = keys.replace(/\"|&nbsp;|\\/g, '').replace(/(^\s*)|(\s*$)/g, "");
    if (keys == "" || keys == null || keys == "null" || keys === "undefined") {
      return true;
    } else {
      return false;
    }
  } else if (typeof keys === "undefined") {
    return true;
  } else if (typeof keys === "number") {
    return false;
  } else if (typeof keys === "boolean") {
    return false;
  } else if (typeof keys == "object") {
    if (JSON.stringify(keys) == "{}") {
      return true;
    } else if (keys == null) {
      return true;
    } else {
      return false;
    }
  }

  if (keys instanceof Array && keys.length == 0) {
    return true;
  }

}
/**
 * 返回两位的小数的字符串
 */
export const toFixedNum = (num) => {
  const tonum = Number(num).toFixed(2);
  return tonum;
}

/**
 * 错误提示
 */
export const showMessage = () => {
  this.$message({
    showClose: true,
    message: '对不起，您暂无此操作权限~',
    type: 'success'
  });
}

/**
 * 读取base64
 */
export const readFile = file => {
  //判断是否是图片类型
  if (!/image\/\w+/.test(file.raw.type)) {
    alert("只能选择图片");
    return false;
  }
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function (e) {
    var filedata = {
      filename: file.name,
      filebase64: e.target.result
    }
    console.log(e.target.result)
  }
}

// const testMenu = [
//     {
//         path: '/my',
//         name: '用户信息',
//         components: require('@/components/pages/home.vue'),
//         redirect: '/my/index',
//         svgIcon: '#iconyonghu',
//         children: [
//             { path: '/my/index', name: '首页', components: require('@/components/pages/index.vue'), svgIcon: '#iconyonghu' },
//             { path: '/my/myForm', name: '个人资料', components: require('@/components/pages/teForm.vue'), svgIcon: '#iconbiaoge' },
//             { path: '/my/myChart', name: '图表信息', components: require('@/components/pages/teChart.vue'), svgIcon: '#icontubiao' },
//             { path: '/my/myMap', name: '坐标地图', components: require('@/components/pages/teMap.vue'), svgIcon: '#iconditu' }
//         ]
//     },
//     {
//         path: '/per',
//         name: '权限管理',
//         components: require('@/components/pages/home.vue'),
//         svgIcon: '#iconxitongquanxian',
//         children: [
//             { path: '/per/role', name: '角色管理', components: require('@/components/pages/teRole.vue'), svgIcon: '#iconjiaoseguanli' },
//             { path: '/per/menu', name: '菜单管理', components: require('@/components/pages/teMenu.vue'), svgIcon: '#iconcaidan' }
//         ]
//     },
//     {
//         path: '/ed',
//         name: '编辑信息',
//         components: require('@/components/pages/home.vue'),
//         svgIcon: '#iconedit',
//         children: [
//             { path: '/ed/edEdit', name: '编辑新闻', components: require('@/components/pages/teEdit.vue'), svgIcon: '#iconfuwenbenkuang' },
//             { path: '/ed/edTable', name: '展示信息', components: require('@/components/pages/teTable.vue'), svgIcon: '#iconzhanshi' }
//         ]
//     }
// ]

/**
 * 递归循环菜单
 */
export const getMenus = async (menusList) => {
  // let menus = testMenu;
  let menus = [];
  // 登录页获取的数据
  if (menusList) {
    menus = menusList;
  }
  // 刷新时重新获取数据
  menus = await api.menuList.getOnlyMenu();
  let menuChange = [];
  if (menus && menus.data && menus.data.status === 200) {
    menuChange = getRouterMenus(JSON.stringify({ tempMenus: menus.data.content }));
  }
  return menuChange;
}

function getRouterMenus(menus) {
  let arr = [];
  if (menus instanceof Object) {
    arr = menus;
  } else {
    arr = JSON.parse(menus).tempMenus;
  }
  if (arr.length > 0) {
    arr.map(item => {
      if (item.children && item.children.length == 0) {
        delete item.children;
        item.components = require(`@/components/${item.components}.vue`);
      } else {
        // item.components = require(`@/components/pages/${item.components}.vue`);
        item.components = require(`@/components/view/${item.components}/index.vue`);
        if (item.children) {
          item.children = getRouterMenus(item.children);
        }
      }
    });
  }
  return arr;
}

/**
 * 防抖动和节流阀，提高性能，防止浏览器卡死
 * @param func
 * @param wait
 * @param immediate
 * @returns {Function}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args) // 此处apply修改this指向为window
        if (!timeout) context = args = null
      }
    }
  }

  return function (...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout

    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * [numFormat 在数字中加入千分位分隔符，如：234,234]
 * @param {num} [需要转换格式的数字]
 * @return {num}
 */
export function numFormat(num) {
  let tmp = num.toString().replace(/\d+/, function (n) {
    return n.replace(/(?=(\B\d{3})+$)/g, ',')
  })
  return tmp;
}
