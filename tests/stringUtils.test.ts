import { describe, expect, test } from '@jest/globals';
import { camelCase, pascalCase, kebabCase, snakeCase } from '../src/utils/stringUtils.js';

describe('字符串工具函数', () => {
  test('camelCase 应正确转换字符串为驼峰命名', () => {
    expect(camelCase('hello-world')).toBe('helloWorld');
    expect(camelCase('hello_world')).toBe('helloWorld');
    expect(camelCase('HelloWorld')).toBe('helloWorld');
    expect(camelCase('hello world')).toBe('helloWorld');
  });

  test('pascalCase 应正确转换字符串为帕斯卡命名', () => {
    expect(pascalCase('hello-world')).toBe('HelloWorld');
    expect(pascalCase('hello_world')).toBe('HelloWorld');
    expect(pascalCase('helloWorld')).toBe('HelloWorld');
    expect(pascalCase('hello world')).toBe('HelloWorld');
  });

  test('kebabCase 应正确转换字符串为短横线命名', () => {
    expect(kebabCase('helloWorld')).toBe('hello-world');
    expect(kebabCase('HelloWorld')).toBe('hello-world');
    expect(kebabCase('hello_world')).toBe('hello-world');
    expect(kebabCase('hello world')).toBe('hello-world');
  });

  test('snakeCase 应正确转换字符串为下划线命名', () => {
    expect(snakeCase('helloWorld')).toBe('hello_world');
    expect(snakeCase('HelloWorld')).toBe('hello_world');
    expect(snakeCase('hello-world')).toBe('hello_world');
    expect(snakeCase('hello world')).toBe('hello_world');
  });
});
