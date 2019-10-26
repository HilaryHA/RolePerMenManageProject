/**
 * @author Hilary
 * @Date 2019/06/10
 * @parameter 将tree树的数据转换为数组
 */
'use strict'
import Vue from 'vue'
export default function treeToArray(data, expandAll, parent = null, level = null) {
  let tmp = [];
  // 将其他对象转换为数组
  Array.from(data).forEach((record) => {
    if (record._expanded == undefined) {
      Vue.set(record, '_expanded', expandAll); // 向嵌套对象添加响应式属性
    }
    let _level = 1; // ???
    if (level !== undefined && level !== null) {
      _level = level + 1;
    }
    Vue.set(record, '_level', _level);
    // 如果有父元素
    if (parent) {
      Vue.set(record, 'parent', parent);
    }
    tmp.push(record);

    // console.log('=====================', record.children);
    // 【报错】children 和 默认的expand为true时 子选项未出现有关

    if (record.children && record.children.length > 0) {
      const children = treeToArray(record.children, expandAll, record, _level);
      tmp = tmp.concat(children);
    }
  });
  return tmp;
}
