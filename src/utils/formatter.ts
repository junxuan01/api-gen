import prettier from 'prettier';

/**
 * 格式化代码
 */
export async function formatCode(code: string): Promise<string> {
  try {
    // 尝试查找当前项目的prettier配置
    const options = await prettier.resolveConfig(process.cwd());
    
    // 使用prettier格式化代码
    return prettier.format(code, {
      ...options,
      parser: 'typescript', 
      // 默认配置，如果没有找到项目配置则使用这些
      printWidth: 100,
      tabWidth: 2,
      singleQuote: true,
      trailingComma: 'es5',
      semi: true,
    });
  } catch (error) {
    console.warn('代码格式化失败，使用原始代码', error);
    // 如果prettier格式化失败，返回原始代码
    return code;
  }
}
