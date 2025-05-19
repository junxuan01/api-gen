import axios from '../axios';
import { operations } from '../types';

/**
 * 删除用户
 * @param params.id 用户ID
 * @returns Promise with the response data
 */
export async function deleteUser(params: { id: number }): Promise<any> {
  return await axios.delete<any>(`/users/${params.id}`);
}