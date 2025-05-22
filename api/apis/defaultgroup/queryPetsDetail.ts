import { request, RequestOptions } from '../../../utils/request';
import {
  // 导入DTO类型
  queryPetsDetailPathParams,
  queryPetsDetailResponse,
} from '../../dtos/defaultgroup';

/**
 * 查询宠物详情
 *
 * @operationId queryPetsDetail
 */
export async function queryPetsDetail(
  params: queryPetsDetailPathParams,
  options?: RequestOptions
): Promise<queryPetsDetailResponse> {
  return request({
    method: 'get',
    url: `/pet/${params.petId}`,

    ...options,
  });
}
