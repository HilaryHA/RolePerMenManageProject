import base from '../base'
import axios from '@/utils/http'
import { jointParams, showNotification } from './common'

/**
 * 获取权限数据接口
 * @param url
 */
export function getPerm(params) {
  return axios.get(jointParams(`${base.api}/permission`, params));
}

/**
 * 获取所有权限name
 */
export function getAllPerName() {
  return axios.get(`${base.api}/permission/allPerName`);
}

/**
 * 增加权限
 * @param {Object} params
 */
export async function add(params) {
  let addPerm = await axios.post(`${base.api}/permission`, JSON.stringify(params));
  showNotification(addPerm, 'success');
  return addPerm;
}

/**
 * 删除权限
 * @param {String} id 
 */
export async function del(id) {
  let delPerm = await axios.delete(`${base.api}/permission/${id}`);
  showNotification(delPerm, 'success');
  return delPerm;
}

/**
 * 修改权限
 * @param {Object} params 
 */
export async function edit(params) {
  let upPerm = await axios.put(`${base.api}/permission/${params.id}`, params);
  showNotification(upPerm, 'success');
  return upPerm;
}
