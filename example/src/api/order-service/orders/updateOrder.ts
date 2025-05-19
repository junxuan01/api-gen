import axios from '../axios';
import { operations } from '../types';

/**
 * 更新订单
 * @param params.id 订单ID
 * @param data 请求体数据
 * @returns Promise with the response data
 */
export async function updateOrder(params: { id: number }, data: operations['updateOrder']['requestBody']['content']['application/json']): Promise<operations['updateOrder']['responses']['200']['content']['application/json']> {
  return await axios.put<operations['updateOrder']['responses']['200']['content']['application/json']>(`/orders/${params.id}`, data);
}