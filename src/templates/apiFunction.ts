import { Endpoint } from '../utils/openApiParser.js';
import { camelCase, pascalCase } from '../utils/stringUtils.js';

/**
 * 生成API请求函数
 */
export function generateApiFunction(
  endpoint: Endpoint, 
  serviceName: string,
  prefix?: string
): { functionName: string, code: string } {
  const { path, method, operationId, summary, parameters, requestBody, responses } = endpoint;
  
  // 生成函数名
  let functionName = operationId 
    ? camelCase(operationId) 
    : camelCase(`${method}${path.split('/').filter(Boolean).map(pascalCase).join('')}`);
  
  // 添加前缀（如果提供）
  if (prefix) {
    functionName = `${prefix}${pascalCase(functionName)}`;
  }
  
  // 确定参数类型
  let hasParams = false;
  let hasQuery = false;
  let hasBody = false;
  
  // 定义函数参数
  let fnParams = '';
  let fnDocParams = [];
  let fnInnerParams = [];
  
  // 处理路径参数
  const pathParams = parameters?.filter(p => p.in === 'path') || [];
  if (pathParams.length > 0) {
    hasParams = true;
    fnParams += 'params: { ';
    pathParams.forEach(param => {
      fnParams += `${param.name}: ${determineTypeFromSchema(param.schema) || 'any'}, `;
      fnDocParams.push(`@param params.${param.name} ${param.description || ''}`);
    });
    fnParams = fnParams.slice(0, -2) + ' }';
    fnInnerParams.push('params');
  }
  
  // 处理查询参数
  const queryParams = parameters?.filter(p => p.in === 'query') || [];
  if (queryParams.length > 0) {
    hasQuery = true;
    if (fnParams) fnParams += ', ';
    fnParams += 'query: { ';
    queryParams.forEach(param => {
      fnParams += `${param.name}${param.required ? '' : '?'}: ${determineTypeFromSchema(param.schema) || 'any'}, `;
      fnDocParams.push(`@param query.${param.name} ${param.description || ''}`);
    });
    fnParams = fnParams.slice(0, -2) + ' }';
    fnInnerParams.push('query');
  }
  
  // 处理请求体
  if (requestBody && requestBody.content) {
    hasBody = true;
    if (fnParams) fnParams += ', ';
    fnParams += `data: operations['${operationId}']['requestBody']['content']['application/json']`;
    fnDocParams.push('@param data 请求体数据');
    fnInnerParams.push('data');
  }
  
  // 如果没有参数，添加空对象参数
  if (!fnParams) {
    fnParams = 'options?: { [key: string]: any }';
    fnInnerParams.push('options');
  }
  
  // 确定返回类型
  let responseType = 'any';
  if (responses && responses['200']) {
    const successResponse = responses['200'];
    if (successResponse.content && successResponse.content['application/json']) {
      responseType = `operations['${operationId}']['responses']['200']['content']['application/json']`;
    }
  }
  
  // 构建API路径
  let apiPath = path;
  // 替换路径参数 {param} -> ${params.param}
  if (hasParams) {
    apiPath = apiPath.replace(/{([^}]+)}/g, '${params.$1}');
  }
  
  // 构建函数代码
  let code = `import axios from '../axios';
import { operations } from '../types';

/**
 * ${summary || `${method.toUpperCase()} ${path}`}
 * ${fnDocParams.join('\n * ')}
 * @returns Promise with the response data
 */
export async function ${functionName}(${fnParams}): Promise<${responseType}> {
  return await axios.${method}<${responseType}>(\`${apiPath}\`${hasQuery ? ', { params: query }' : ''}${hasBody ? ', data' : ''});
}`;

  return { functionName, code };
}

/**
 * 从OpenAPI schema确定TypeScript类型
 */
function determineTypeFromSchema(schema: any): string {
  if (!schema) return 'any';
  
  switch (schema.type) {
    case 'string':
      return 'string';
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      if (schema.items) {
        return `${determineTypeFromSchema(schema.items)}[]`;
      }
      return 'any[]';
    case 'object':
      if (schema.properties) {
        let result = '{ ';
        for (const prop in schema.properties) {
          const required = schema.required && schema.required.includes(prop);
          result += `${prop}${required ? '' : '?'}: ${determineTypeFromSchema(schema.properties[prop])}, `;
        }
        return result ? result.slice(0, -2) + ' }' : 'Record<string, any>';
      }
      return 'Record<string, any>';
    default:
      return 'any';
  }
}
