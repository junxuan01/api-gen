// 入口文件
import { run } from "./utils/cli.js";

// 应用标题
console.log("==== API-Gen 主程序 ====");

// 执行命令行程序
run().catch((error: unknown) => {
  console.error("程序执行失败:", error);
  process.exit(1);
});
