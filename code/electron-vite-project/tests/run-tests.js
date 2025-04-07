#!/usr/bin/env node

/**
 * 简单的测试启动器，用于运行所有单元测试和集成测试
 */

import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

console.log('🧪 开始运行所有测试 ...');

// 获取当前目录 (ES模块中需要使用fileURLToPath)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 运行单元测试
console.log('\n📦 运行单元测试 ...');
const unitTestResult = spawnSync('npx', ['jest', '--testPathPattern=unit'], {
  cwd: projectRoot,
  stdio: 'inherit'
});

if (unitTestResult.status !== 0) {
  console.error('\n❌ 单元测试失败');
  process.exit(1);
}

console.log('\n✅ 单元测试通过');

// 运行集成测试
console.log('\n🔄 运行集成测试 ...');
const integrationTestResult = spawnSync('npx', ['jest', '--testPathPattern=integration'], {
  cwd: projectRoot,
  stdio: 'inherit'
});

if (integrationTestResult.status !== 0) {
  console.error('\n❌ 集成测试失败');
  process.exit(1);
}

console.log('\n✅ 集成测试通过');

// 所有测试都通过
console.log('\n🎉 所有测试通过!');
process.exit(0); 