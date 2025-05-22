/**
 * 路径别名解析工具
 * 替代原来的 Bun 路径别名功能
 */
import { register } from "tsconfig-paths";
import path from "path";

// 在应用启动时注册路径别名
export function registerPathAliases() {
  register({
    baseUrl: path.join(process.cwd()),
    paths: {
      "@/*": ["src/*"],
      "@config/*": ["src/config/*"],
      "@templates/*": ["src/templates/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"],
    },
  });
}
