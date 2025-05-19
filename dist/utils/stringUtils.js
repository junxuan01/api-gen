/**
 * 转换为驼峰命名法
 */
export function camelCase(str) {
    return str
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
        .replace(/^([A-Z])/, m => m.toLowerCase());
}
/**
 * 转换为帕斯卡命名法
 */
export function pascalCase(str) {
    const camel = camelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
}
/**
 * 转换为短横线命名法
 */
export function kebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}
/**
 * 转换为下划线命名法
 */
export function snakeCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase();
}
//# sourceMappingURL=stringUtils.js.map