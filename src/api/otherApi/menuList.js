import base from '../base';
import axios from '@/utils/http';
import { jointParams, showNotification } from './common'

const menuList = {
  /**
   * 获取所有路由菜单
   * @param {Object} params 
   */
  getMenuList(params) {
    return axios.get(jointParams(`${base.menu}`, params));
  },

  /**
   * 创建菜单
   * @param {Object} params 
   */
  async add(params) {
    let addMenu = await axios.post(`${base.menu}`, params);
    showNotification(addMenu, 'success');
    return addMenu;
  },

  /**
   * 修改菜单
   * @param {Object} params 
   */
  async edit(params) {
    let editMenu = await axios.put(`${base.menu}/${params.id}`, params);
    showNotification(editMenu, 'success');
    return editMenu;
  },

  /**
   * 删除菜单
   * @param {String} id 
   */
  async del(id) {
    let delMenu = await axios.delete(`${base.menu}/${id}`);
    showNotification(delMenu, 'success');
    return delMenu;
  },

  /**
   * 获取对应权限下的菜单
   */
  getOnlyMenu() {
    return axios.get(`${base.menu}/user`);
  }
}

export default menuList;
