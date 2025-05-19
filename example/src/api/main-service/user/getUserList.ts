import axios from '../axios';
import { operations } from '../types';

/**
 * 获取用户列表
 * @param query.page 页码
 * @param query.pageSize 每页条数
 * @returns Promise with the response data
 */
export async function getUserList(query: { page?: number, pageSize?: number }): Promise<operations['getUserList']['responses']['200']['content']['application/json']> {
  return await axios.get<operations['getUserList']['responses']['200']['content']['application/json']>(`/users`, { params: query });
}