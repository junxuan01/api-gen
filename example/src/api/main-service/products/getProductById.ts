import axios from '../axios';
import { operations } from '../types';

/**
 * 获取产品详情
 * @param params.id 产品ID
 * @returns Promise with the response data
 */
export async function getProductById(params: { id: number }): Promise<operations['getProductById']['responses']['200']['content']['application/json']> {
  return await axios.get<operations['getProductById']['responses']['200']['content']['application/json']>(`/products/${params.id}`);
}