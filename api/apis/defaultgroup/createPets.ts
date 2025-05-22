import { request, RequestOptions } from '../../../utils/request';
import {
  // 导入DTO类型
  createPetsRequestBody,
  createPetsResponse,
} from '../../dtos/defaultgroup';

/**
 * 新建宠物信息
 *
 * @operationId createPets
 */
export async function createPets(
  body: createPetsRequestBody,
  options?: RequestOptions
): Promise<createPetsResponse> {
  return request({
    method: 'post',
    url: '/pet',

    data: body,
    ...options,
  });
}
