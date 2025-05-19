import axios from '../axios';
import { operations } from '../types';

/**
 * 创建支付
 * @param data 请求体数据
 * @returns Promise with the response data
 */
export async function createPayment(data: operations['createPayment']['requestBody']['content']['application/json']): Promise<any> {
  return await axios.post<any>(`/payments`, data);
}