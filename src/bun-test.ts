// 测试 Bun 是否能正确加载并运行 TypeScript 文件
// 先使用相对路径进行基本测试

// 使用相对路径导入
import { paths } from "./utils/bun-register";

// 测试 Bun 的 TypeScript 支持
const testFunction = (message: string): void => {
  console.log(`Bun 测试: ${message}`);
};

// 测试基本功能
console.log("项目路径信息:", paths);
testFunction("TypeScript 支持正常工作");
console.log("如果您能看到这条消息，说明 Bun 配置成功！");

// 尝试使用 Bun API
console.log("Bun 版本:", Bun.version);
console.log("运行环境:", Bun.env.NODE_ENV || "development");
