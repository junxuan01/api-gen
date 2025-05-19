import axios from '../axios';
import { operations } from '../types';

/**
 * 获取订单列表
 * @param query.page 页码
 * @param query.pageSize 每页条数
 * @param query.status 订单状态
 * @returns Promise with the response data
 */
export async function getOrderList(query: { page?: number, pageSize?: number, status?: string }): Promise<operations['getOrderList']['responses']['200']['content']['application/json']> {
  return await axios.get<operations['getOrderList']['responses']['200']['content']['application/json']>(`/orders`, { params: query });
}