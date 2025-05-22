import { request, RequestOptions } from '../../../utils/request';
import {
  // 导入DTO类型
  updatePetsRequestBody,
  updatePetsResponse,
} from '../../dtos/defaultgroup';

/**
 * 修改宠物信息
 *
 * @operationId updatePets
 */
export async function updatePets(
  body: updatePetsRequestBody,
  options?: RequestOptions
): Promise<updatePetsResponse> {
  return request({
    method: 'put',
    url: '/pet',

    data: body,
    ...options,
  });
}
