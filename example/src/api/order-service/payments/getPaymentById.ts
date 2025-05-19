import axios from '../axios';
import { operations } from '../types';

/**
 * 获取支付详情
 * @param params.id 支付ID
 * @returns Promise with the response data
 */
export async function getPaymentById(params: { id: number }): Promise<operations['getPaymentById']['responses']['200']['content']['application/json']> {
  return await axios.get<operations['getPaymentById']['responses']['200']['content']['application/json']>(`/payments/${params.id}`);
}