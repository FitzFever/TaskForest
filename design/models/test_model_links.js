/**
 * 模型文件链接测试脚本
 * 用于测试符号链接和文件访问
 */
const fs = require('fs');
const path = require('path');

console.log('模型文件链接测试...');

// 检查导出目录是否存在
const exportDir = path.resolve(__dirname, 'export');
console.log(`检查导出目录: ${exportDir}`);
if (fs.existsSync(exportDir)) {
  console.log('✓ 导出目录存在');
  
  // 检查树木模型目录
  const treesDir = path.resolve(exportDir, 'trees');
  console.log(`检查树木模型目录: ${treesDir}`);
  if (fs.existsSync(treesDir)) {
    console.log('✓ 树木模型目录存在');
    
    // 列出树木模型文件
    const treeFiles = fs.readdirSync(treesDir);
    console.log(`找到 ${treeFiles.length} 个树木模型文件:`);
    treeFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
  } else {
    console.error('✗ 树木模型目录不存在');
  }
} else {
  console.error('✗ 导出目录不存在');
}

// 检查符号链接
const clientModelsDir = path.resolve(__dirname, '../../client/public/models');
console.log(`\n检查客户端模型目录: ${clientModelsDir}`);
if (fs.existsSync(clientModelsDir)) {
  console.log('✓ 客户端模型目录存在');
  
  try {
    const stats = fs.lstatSync(clientModelsDir);
    if (stats.isSymbolicLink()) {
      console.log('✓ 客户端模型目录是符号链接');
      
      // 获取链接目标
      const linkTarget = fs.readlinkSync(clientModelsDir);
      console.log(`  链接目标: ${linkTarget}`);
      
      // 验证链接目标是否存在
      if (fs.existsSync(fs.realpathSync(clientModelsDir))) {
        console.log('✓ 链接目标存在');
      } else {
        console.error('✗ 链接目标不存在');
      }
    } else {
      console.log('✗ 客户端模型目录不是符号链接');
    }
  } catch (err) {
    console.error(`✗ 检查符号链接时出错: ${err.message}`);
  }
} else {
  console.error('✗ 客户端模型目录不存在');
}

console.log('\n测试完成!'); 