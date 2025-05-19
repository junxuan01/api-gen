import axios from '../axios';
import { operations } from '../types';

/**
 * 创建用户
 * @param data 请求体数据
 * @returns Promise with the response data
 */
export async function createUser(data: operations['createUser']['requestBody']['content']['application/json']): Promise<any> {
  return await axios.post<any>(`/users`, data);
}