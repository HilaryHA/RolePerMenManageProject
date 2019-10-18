import Element from 'element-ui';

/**
 * 消息提示：返回值为200时，弹出框显示【成功、信息】类操作
 * @param obj
 * @param description
 */
export function showTip(obj , description) {
  if ( obj && obj.data.status == 200 ) {
    Element.Message({
      type: description ,
      message: obj.data.info
    })
  }
}

/**
 * 悬浮出现在页面角落，显示全局的通知提醒消息。
 * @param obj
 * @param description
 */
export function showNotification (obj , description) {
  if ( obj && obj.data.status == 200 ) {
    Element.Notification({
      type: description,
      title: '提示',
      message: obj.data.info,
      offset: 50
    })
  }
}

/**
 * 连接get接口和参数
 * @param url
 * @param obj
 */
export function jointParams(url, obj) {
  let params = "";
  let temp = "";
  if (obj == undefined || obj == null) { // 未传递参数
    return url;
  }else if (obj instanceof Object) {
    for (let key in obj) {
      if (Array.isArray(obj[key])) { // 判断是否为数组
        let arr = obj[key];
        for (let i = 0; i<arr.length; i++) {
          temp += `&${key}=${arr[i]}`; // 如参数为{"test": "nihao", "tt": ["2","dd"]}
        }
      } else {
        params += `&${key}=${obj[key]}`;
      }
    }
    params = (params + temp).replace('&', '?'); // 替换第一个"&"为"?"
  } else {
    params = `/${obj}`; // 如接口为.../dictDetail/dept_status
  }
  return url += params;
}
