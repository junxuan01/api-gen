import { request, RequestOptions } from '../../../utils/request';
import {
  // 导入DTO类型
  removePetsPathParams,
  removePetsResponse,
} from '../../dtos/defaultgroup';

/**
 * 删除宠物信息
 *
 * @operationId removePets
 */
export async function removePets(
  params: removePetsPathParams,
  options?: RequestOptions
): Promise<removePetsResponse> {
  return request({
    method: 'delete',
    url: `/pet/${params.petId}`,

    ...options,
  });
}
