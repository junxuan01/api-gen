import axios from '../axios';
import { operations } from '../types';

/**
 * 获取产品列表
 * @param query.page 页码
 * @param query.pageSize 每页条数
 * @param query.category 产品分类
 * @returns Promise with the response data
 */
export async function getProductList(query: { page?: number, pageSize?: number, category?: string }): Promise<operations['getProductList']['responses']['200']['content']['application/json']> {
  return await axios.get<operations['getProductList']['responses']['200']['content']['application/json']>(`/products`, { params: query });
}