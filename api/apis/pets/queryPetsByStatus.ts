import { request, RequestOptions } from '../../../utils/request';
import {
  // 导入DTO类型
  queryPetsByStatusQueryParams,
  queryPetsByStatusResponse,
} from '../../dtos/pets';

/**
 * 根据状态查找宠物列表
 *
 * @operationId queryPetsByStatus
 */
export async function queryPetsByStatus(
  query: queryPetsByStatusQueryParams,
  options?: RequestOptions
): Promise<queryPetsByStatusResponse> {
  return request({
    method: 'get',
    url: '/pet/findByStatus',
    params: query,

    ...options,
  });
}
