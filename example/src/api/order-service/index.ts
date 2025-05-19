import * as order from './order';
import * as payment from './payment';
import * as orders from './orders';
import * as payments from './payments';
import instance from './axios';

// 重导出模块
export { order };
export { payment };
export { orders };
export { payments };

// 重导出axios实例
export const axios = instance;

// 类型定义
export * from './types';