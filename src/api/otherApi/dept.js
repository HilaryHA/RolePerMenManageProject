import base from '../base'
import axios from '@/utils/http'
import { jointParams, showNotification } from './common'

/**
 * 获取部门数据接口
 * @param {Object} params 
 */
export function getDepts(params) {
  return axios.get(jointParams(`${base.api}/dept`, params));
}

/**
 * 增加部门
 * @param {Object} params 
 */
export async function add(params) {
  let addDept = await axios.post(`${base.api}/dept`, JSON.stringify(params));
  showNotification(addDept, 'success');
  return addDept;
}

/**
 * 删除部门
 * @param {String} id 
 */
export async function del(id) {
  let delDept = await axios.delete(`${base.api}/dept/${id}`);
  showNotification(delDept, 'success');
  return delDept;
}

/**
 * 修改部门
 * @param {Object} params 
 */
export async function edit(params) {
  let upDept = await axios.put(`${base.api}/dept/${params.id}`, params);
  showNotification(upDept, 'success');
  return upDept;
}
