import axios from '../axios';
import { operations } from '../types';

/**
 * 获取用户详情
 * @param params.id 用户ID
 * @returns Promise with the response data
 */
export async function getUserById(params: { id: number }): Promise<operations['getUserById']['responses']['200']['content']['application/json']> {
  return await axios.get<operations['getUserById']['responses']['200']['content']['application/json']>(`/users/${params.id}`);
}