import axios from '../axios';
import { operations } from '../types';

/**
 * 创建订单
 * @param data 请求体数据
 * @returns Promise with the response data
 */
export async function createOrder(data: operations['createOrder']['requestBody']['content']['application/json']): Promise<any> {
  return await axios.post<any>(`/orders`, data);
}