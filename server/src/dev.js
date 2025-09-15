/**
 * TaskForest开发环境服务器
 * 用于提供前端所需的后端API
 * 
 * 注意：此文件仅作为兼容层保留，用于渐进式迁移。请使用新的 dev-server.js 启动服务器。
 * 将于后续版本废弃此文件。
 */

// 导入新的服务器入口点
import './dev-server.js';

// 输出迁移提示
console.log('\n⚠️ 提示: dev.js 已重构为模块化结构');
console.log('⚠️ 此文件仅作为兼容层保留');
console.log('⚠️ 请使用 node src/dev-server.js 启动开发服务器');
console.log('⚠️ 这个文件将在后续版本中删除\n'); 