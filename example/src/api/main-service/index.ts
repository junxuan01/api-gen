import * as user from './user';
import * as product from './product';
import * as users from './users';
import * as products from './products';
import instance from './axios';

// 重导出模块
export { user };
export { product };
export { users };
export { products };

// 重导出axios实例
export const axios = instance;

// 类型定义
export * from './types';