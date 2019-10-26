import base from '../base'
import axios from '@/utils/http'
import { jointParams } from './common'

/**
 * 获取字典数据接口
 * @param {String} dictName 
 */
export function get(dictName) {
  return axios.get(jointParams(`${base.api}/dictDetail`, dictName));
}
