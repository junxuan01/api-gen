export interface Pet {
  /** @description 宠物ID编号 */
  id: number;
  /** @description 分组 */
  category: Category;
  /** @description 名称 */
  name: string;
  /** @description 照片URL */
  photoUrls: string[];
  /** @description 标签 */
  tags: Tag[];
  /** @description 宠物销售状态 */
  status: 'available' | 'pending' | 'sold';
}
