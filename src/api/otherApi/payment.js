import base from '../base'
import axios from '@/utils/http'
import { jointParams, showNotification } from './common'

/**
 * 支付相关接口
 * @param {*} params 
 */
export function doPay(params) {
  return axios.post(`${base.api}/alipay`, JSON.stringify(params));
}

/**
 * 查询支付是否成功
 * @param {String} tradeNo 订单号
 */
export function queryPay(tradeNo) {
  return axios.get(`${base.api}/alipay/${tradeNo}`);
}

export function del(tradeNo) {
  return axios.delete(`${base.api}/alipay/${tradeNo}`);
}