import axios from '../axios';
import { operations } from '../types';

/**
 * 更新用户
 * @param params.id 用户ID
 * @param data 请求体数据
 * @returns Promise with the response data
 */
export async function updateUser(params: { id: number }, data: operations['updateUser']['requestBody']['content']['application/json']): Promise<operations['updateUser']['responses']['200']['content']['application/json']> {
  return await axios.put<operations['updateUser']['responses']['200']['content']['application/json']>(`/users/${params.id}`, data);
}