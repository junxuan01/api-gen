/**
 * 从OpenAPI schema中提取模块（使用tags或目录结构）
 */
export declare function extractModules(schema: any): string[];
/**
 * API端点信息
 */
export interface Endpoint {
    path: string;
    method: string;
    operationId: string;
    summary: string;
    tags: string[];
    parameters: any[];
    requestBody: any;
    responses: any;
}
/**
 * 获取指定模块的所有端点
 */
export declare function getEndpointsByModule(schema: any, moduleName: string): Endpoint[];
//# sourceMappingURL=openApiParser.d.ts.map