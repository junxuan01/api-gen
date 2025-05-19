/**
 * 生成索引文件
 */
export function generateIndex(serviceName, modules) {
    let imports = [];
    let exports = [];
    for (const module of modules) {
        imports.push(`import * as ${module} from './${module}';`);
        exports.push(module);
    }
    imports.push(`import instance from './axios';`);
    return `${imports.join('\n')}

// 重导出模块
${exports.map(m => `export { ${m} };`).join('\n')}

// 重导出axios实例
export const axios = instance;

// 类型定义
export * from './types';`;
}
//# sourceMappingURL=index.js.map