import axios from '../axios';
import { operations } from '../types';

/**
 * 取消订单
 * @param params.id 订单ID
 * @returns Promise with the response data
 */
export async function cancelOrder(params: { id: number }): Promise<any> {
  return await axios.delete<any>(`/orders/${params.id}`);
}