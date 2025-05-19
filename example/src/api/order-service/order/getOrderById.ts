import axios from '../axios';
import { operations } from '../types';

/**
 * 获取订单详情
 * @param params.id 订单ID
 * @returns Promise with the response data
 */
export async function getOrderById(params: { id: number }): Promise<operations['getOrderById']['responses']['200']['content']['application/json']> {
  return await axios.get<operations['getOrderById']['responses']['200']['content']['application/json']>(`/orders/${params.id}`);
}