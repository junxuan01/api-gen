// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  splitting: false,
  outDir: "dist",
  // 自动读取 tsconfig.json 中的路径别名
  tsconfig: "./tsconfig.json",
  // 确保正确处理 .js 扩展名
  outExtension({ format }) {
    return {
      js: `.js`,
    };
  },
  // 提供构建信息
  onSuccess: "echo 构建成功! 输出目录: dist/",
  // 指定使用 Bun 作为构建环境
  env: {
    NODE_ENV: process.env.NODE_ENV || "development",
  },
});
