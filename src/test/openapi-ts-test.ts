#!/usr/bin/env bun
// 测试文件 - 验证 openapi-typescript 在 Bun 环境下的使用

import { generateTypeDefinitions } from "../utils/openapi.js";
import fs from "fs-extra";
import path from "path";

// 创建输出目录
const outDir = path.resolve(process.cwd(), "test-output");
fs.ensureDirSync(outDir);

async function runTest() {
  console.log("🚀 开始测试 OpenAPI TypeScript 生成功能");
  console.log("---------------------------------------------------");

  // 测试公开的 OpenAPI 规范 URL
  const testUrl = "https://petstore3.swagger.io/api/v3/openapi.json";
  console.log(`使用 URL 测试: ${testUrl}`);

  try {
    // 测试 URL 输入
    console.log("\n测试 URL 输入...");
    const urlResult = await generateTypeDefinitions(testUrl);

    // 将生成的类型定义写入文件
    const urlOutputPath = path.join(outDir, "url-schema.ts");
    await fs.writeFile(urlOutputPath, urlResult.schema);
    console.log(`✅ URL 测试成功! 生成的类型已保存到: ${urlOutputPath}`);

    // 记录生成的类型长度
    console.log(`生成的类型定义大小: ${urlResult.schema.length} 字节`);

    // 检查生成的内容是否看起来是有效的 TypeScript
    if (
      urlResult.schema.includes("export interface") ||
      urlResult.schema.includes("export type") ||
      urlResult.schema.includes("export namespace")
    ) {
      console.log("✅ 生成的内容看起来是有效的 TypeScript");
    } else {
      console.log("⚠️ 警告: 生成的内容可能不是有效的 TypeScript");
    }

    console.log("\n测试完成!");
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

// 运行测试
runTest().catch(console.error);
