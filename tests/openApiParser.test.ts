import { describe, expect, test } from '@jest/globals';
import { extractModules, getEndpointsByModule } from '../src/utils/openApiParser.js';

describe('OpenAPI解析器工具', () => {
  test('extractModules 应从OpenAPI schema中提取模块', () => {
    // 模拟一个OpenAPI schema
    const mockSchema = {
      tags: [
        { name: 'users' },
        { name: 'products' }
      ],
      paths: {
        '/users': {},
        '/users/{id}': {},
        '/products': {},
        '/orders/{id}': {}
      }
    };

    const modules = extractModules(mockSchema);
    
    // 应该提取出users、products和orders模块
    expect(modules).toContain('users');
    expect(modules).toContain('products');
    expect(modules).toContain('orders');
  });

  test('当没有tags或paths时应返回默认模块', () => {
    const mockSchema = {};
    const modules = extractModules(mockSchema);
    
    expect(modules).toEqual(['default']);
  });

  test('getEndpointsByModule 应按模块返回正确的端点', () => {
    // 模拟一个OpenAPI schema
    const mockSchema = {
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
            tags: ['users'],
            summary: 'Get all users'
          }
        },
        '/products': {
          get: {
            operationId: 'getProducts',
            tags: ['products'],
            summary: 'Get all products'
          }
        }
      }
    };

    const userEndpoints = getEndpointsByModule(mockSchema, 'users');
    
    expect(userEndpoints.length).toBe(1);
    expect(userEndpoints[0].operationId).toBe('getUsers');
  });
});
