import base from '../base'
import axios from '@/utils/http'
import { jointParams, showNotification } from './common'

/**
 * 【文档编辑接口】
 * 上传图片
 * @param {FormData} params
 */
export function uploadImage(params) {
  // 【注意修改Content-Type文件类型】 "multipart/form-data"表示表单中进行文件上传
  return axios.post(`${base.api}/tinymceDocu/addPicture`, params, { "Content-Type": "multipart/form-data" });
}

/**
 * 删除图片
 * @param {*} _id 
 */
export async function delImage(_id) {
  let img = await axios.delete(`${base.api}/tinymceDocu/picture/${_id}`);
  showNotification(img, 'success');
  return img;
}

/**
 * 创建文档信息
 * @param {Object} params 
 */
export async function add(params) {
  let docu = await axios.post(`${base.api}/tinymceDocu/userDocu`, params);
  showNotification(docu, 'success');
  return docu;
}

/**
 * 修改文档信息
 * @param {Object} params 
 */   
export async function edit(params) {
  let docu = await axios.put(`${base.api}/tinymceDocu/userDocu/${params._id}`, params);
  showNotification(docu, 'success');
  return docu;
}

/**
 * 删除文档信息
 * @param {*} _id 
 */
export async function del(_id) {
  let docu = await axios.delete(`${base.api}/tinymceDocu/userDocu/${_id}`);
  showNotification(docu, 'success');
  return docu;
}