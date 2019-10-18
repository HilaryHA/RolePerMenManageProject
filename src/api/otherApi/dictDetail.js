import base from '../base'
import axios from '@/utils/http'
import {jointParams} from './common'

/**
 * 获取字典数据接口
 * @param url
 */
export function get(dictName) {
  // const params = {
  //   dictName
  // }
  return axios.get(jointParams(`${base.api}/dictDetail`, dictName));
}
