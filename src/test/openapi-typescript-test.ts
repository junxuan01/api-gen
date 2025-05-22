#!/usr/bin/env bun
// src/test/openapi-typescript-test.ts
// 测试 openapi-typescript 集成

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchOpenApiDocument, generateTypeDefinitions } from '../utils/openapi.js';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '../../test-output/openapi-test');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 测试URL - 使用OpenAPI 3.0规范
const testOpenApiUrl = 'https://petstore3.swagger.io/api/v3/openapi.json';

async function runTest() {
  console.log('开始测试 openapi-typescript 集成...');
  
  try {
    // 从URL获取OpenAPI文档
    console.log(`获取OpenAPI文档: ${testOpenApiUrl}`);
    const openApiDoc = await fetchOpenApiDocument(testOpenApiUrl);
    console.log('OpenAPI文档获取成功');
    
    // 保存文档
    fs.writeFileSync(
      path.join(outputDir, 'openapi-doc.json'),
      JSON.stringify(openApiDoc, null, 2)
    );
    
    // 使用URL生成类型
    console.log('使用URL生成类型...');
    try {
      const { schema: urlSchema } = await generateTypeDefinitions(testOpenApiUrl);
      fs.writeFileSync(
        path.join(outputDir, 'schema-from-url.ts'), 
        urlSchema
      );
      console.log('从URL成功生成类型');
    } catch (urlError) {
      console.error('从URL生成类型失败:', urlError);
    }
    
    // 使用对象生成类型
    console.log('使用对象生成类型...');
    try {
      const { schema: objectSchema, dtos } = await generateTypeDefinitions(openApiDoc);
      fs.writeFileSync(
        path.join(outputDir, 'schema-from-object.ts'), 
        objectSchema
      );
      console.log('从对象成功生成类型');
      
      // 保存DTOs
      const dtosDir = path.join(outputDir, 'dtos');
      if (!fs.existsSync(dtosDir)) {
        fs.mkdirSync(dtosDir);
      }
      
      let dtosCount = 0;
      for (const [dtoName, dtoContent] of Object.entries(dtos)) {
        fs.writeFileSync(
          path.join(dtosDir, `${dtoName}.ts`),
          dtoContent
        );
        dtosCount++;
      }
      
      console.log(`生成了 ${dtosCount} 个DTO`);
    } catch (objectError) {
      console.error('从对象生成类型失败:', objectError);
    }
    
    console.log('测试完成!');
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
console.log('开始执行测试函数...');
runTest().then(() => {
  console.log('测试执行完成');
}).catch(err => {
  console.error('运行测试失败:', err);
  process.exit(1);
});
