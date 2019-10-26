import base from '../base'
import axios from '@/utils/http'
import { jointParams, showNotification } from './common'

/**
 * 获取角色数据接口
 * @param {Object} params 
 */
export function getRoles(params) {
  return axios.get(jointParams(`${base.api}/role`, params));
}

/**
 * 增加角色
 * @param {Object} params 
 */
export async function add(params) {
  let addDept = await axios.post(`${base.api}/role`, JSON.stringify(params));
  showNotification(addDept, 'success');
  return addDept;
}

/**
 * 删除角色
 * @param {String} id 
 */
export async function del(id) {
  let delDept = await axios.delete(`${base.api}/role/${id}`);
  showNotification(delDept, 'success');
  return delDept;
}

/**
 * 编辑角色
 * @param {Object} params 
 */
export async function edit(params) {
  let upDept = await axios.put(`${base.api}/role/${params.id}`, params);
  showNotification(upDept, 'success');
  return upDept;
}

/**
 * 获取某一个指定角色的菜单和权限信息
 * @param {String} id 
 */
export async function getOneRole(id) {
  let oneRole = await axios.get(`${base.api}/role/${id}`);
  return oneRole;
}

/**
 * 根据角色修改菜单数据
 * @param {String} id 
 * @param {Object} params 
 */
export async function setRoleMenus(id, params) {
  let roleMenus = await axios.put(`${base.api}/role/menus/${id}`, params);
  showNotification(roleMenus, 'success');
  return roleMenus;
}

/**
 * 根据角色修改权限数据
 * @param {String} id 
 * @param {Object} params 
 */
export async function setRolePerms(id, params) {
  let rolePerms = await axios.put(`${base.api}/role/permission/${id}`, params);
  showNotification(rolePerms, 'success');
  return rolePerms;
}