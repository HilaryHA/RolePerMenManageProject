import base from '../base'
import axios from '@/utils/http'
import { jointParams } from './common'

/**
 * 获取表格数据接口
 * @param url
 * @param params
 * @returns {T | ActiveX.IXMLDOMNode | Promise<any> | V | string | IDBRequest | *}
 */
export function getInitData(url, params) {
  return axios.get(jointParams(`${base.api}/${url}`, params));
}
