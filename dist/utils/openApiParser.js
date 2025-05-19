/**
 * 从OpenAPI schema中提取模块（使用tags或目录结构）
 */
export function extractModules(schema) {
    const modules = new Set();
    // 先尝试从tags中提取模块
    if (schema.tags && Array.isArray(schema.tags)) {
        for (const tag of schema.tags) {
            if (tag.name) {
                modules.add(tag.name.toLowerCase());
            }
        }
    }
    // 再尝试从路径中提取模块
    if (schema.paths) {
        for (const path in schema.paths) {
            // 尝试从路径中提取模块，例如 /users/xxx => users
            const parts = path.split('/').filter(p => p && !p.startsWith('{'));
            if (parts.length > 0) {
                modules.add(parts[0].toLowerCase());
            }
        }
    }
    // 如果未找到模块，使用默认模块
    if (modules.size === 0) {
        modules.add('default');
    }
    return Array.from(modules);
}
/**
 * 获取指定模块的所有端点
 */
export function getEndpointsByModule(schema, moduleName) {
    const endpoints = [];
    if (!schema.paths)
        return endpoints;
    for (const path in schema.paths) {
        const pathItem = schema.paths[path];
        for (const method in pathItem) {
            if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
                const operation = pathItem[method];
                const tags = operation.tags || [];
                // 检查是否属于当前模块
                const pathModule = path.split('/').filter(p => p)[0]?.toLowerCase() || '';
                if (
                // 如果标签中包含模块名
                tags.map((t) => t.toLowerCase()).includes(moduleName.toLowerCase()) ||
                    // 或者路径的第一级与模块名匹配
                    pathModule === moduleName.toLowerCase() ||
                    // 或者模块是"default"，且该操作没有被其他模块认领
                    (moduleName === 'default' && tags.length === 0 && pathModule === '')) {
                    endpoints.push({
                        path,
                        method,
                        operationId: operation.operationId || `${method}${path.replace(/\//g, '_').replace(/[{}]/g, '')}`,
                        summary: operation.summary || '',
                        tags: operation.tags || [],
                        parameters: operation.parameters || [],
                        requestBody: operation.requestBody,
                        responses: operation.responses
                    });
                }
            }
        }
    }
    return endpoints;
}
//# sourceMappingURL=openApiParser.js.map