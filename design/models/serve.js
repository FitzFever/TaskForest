/**
 * TaskForest 3D模型查看服务器
 * 提供简单的HTTP服务器用于查看模型
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 服务器配置
const PORT = 8080;
const MODELS_DIR = __dirname;  // 当前目录作为模型目录

// 调试模式
const DEBUG = true;

// MIME类型映射
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// 添加CORS头
function addCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  console.log(`收到请求: ${req.method} ${req.url}`);
  
  // 添加CORS头到所有响应
  addCorsHeaders(res);
  
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // 解析URL
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // 处理根路径请求
  if (pathname === '/') {
    pathname = '/viewer.html';
  }
  
  // 模型目录列表API
  if (pathname === '/list') {
    listModels(res);
    return;
  }
  
  // 直接列出导出目录中的模型文件
  if (pathname === '/listExport') {
    listExportModels(res);
    return;
  }
  
  // 创建一个健康检查终点
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      server: 'TaskForest Model Viewer',
      time: new Date().toISOString()
    }));
    return;
  }

  // 构建文件路径
  const filePath = path.join(MODELS_DIR, pathname);
  
  if (DEBUG) {
    console.log(`尝试访问文件: ${filePath}`);
  }
  
  // 检查文件是否存在
  fs.stat(filePath, (err, stats) => {
    if (err) {
      // 文件不存在或其他错误
      console.error(`文件访问错误: ${filePath}, 错误: ${err.message}`);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 未找到 - 文件不存在: ${pathname}`);
      return;
    }
    
    if (stats.isDirectory()) {
      // 列出目录内容
      listDirectory(filePath, pathname, res);
    } else {
      // 发送文件
      serveFile(filePath, res);
    }
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`==============================================`);
  console.log(`TaskForest 3D模型查看器服务启动成功!`);
  console.log(`服务运行于: http://localhost:${PORT}/viewer.html`);
  console.log(`模型目录: ${MODELS_DIR}`);
  console.log(`==============================================`);
});

// 提供单个文件服务
function serveFile(filePath, res) {
  const extname = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  if (DEBUG) {
    console.log(`提供文件: ${filePath}, 类型: ${contentType}`);
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`读取文件失败: ${filePath}, 错误: ${err.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`读取文件失败: ${err.message}`);
      return;
    }
    
    // 增加调试信息
    if (extname === '.glb' || extname === '.gltf') {
      console.log(`===模型文件请求===`);
      console.log(`原始请求URL: ${res.req.url}`);
      console.log(`文件路径: ${filePath}`);
      console.log(`文件大小: ${data.length} 字节`);
      console.log(`内容类型: ${contentType}`);
      console.log(`===============`);
    }
    
    // 设置响应头
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
    
    if (DEBUG && extname === '.glb') {
      console.log(`成功提供模型文件: ${path.basename(filePath)}, 大小: ${data.length} 字节`);
    }
  });
}

// 添加一个新函数来列出导出目录中的模型文件
function listExportModels(res) {
  const exportDir = path.join(MODELS_DIR, 'export/trees');
  
  try {
    console.log(`尝试读取导出目录: ${exportDir}`);
    
    if (!fs.existsSync(exportDir)) {
      console.error(`导出目录不存在: ${exportDir}`);
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: '导出目录不存在',
        path: exportDir
      }));
      return;
    }
    
    const files = fs.readdirSync(exportDir);
    const modelFiles = files.filter(file => file.endsWith('.glb') || file.endsWith('.gltf'));
    
    console.log(`找到 ${modelFiles.length} 个模型文件在目录 ${exportDir}:`);
    modelFiles.forEach(file => console.log(` - ${file}`));
    
    // 返回模型文件列表
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      directory: exportDir,
      files: modelFiles,
      paths: modelFiles.map(file => `/export/trees/${file}`)
    }));
  } catch (err) {
    console.error('列出导出模型时发生错误:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: err.message
    }));
  }
}

// 列出目录结构
function listDirectory(dirPath, urlPath, res) {
  fs.readdir(dirPath, { withFileTypes: true }, (err, entries) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('读取目录失败');
      return;
    }
    
    // 创建HTML文件列表
    let html = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TaskForest 目录: ${urlPath}</title>
        <style>
          body {
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #1890ff;
            border-bottom: 1px solid #e8e8e8;
            padding-bottom: 10px;
          }
          .breadcrumb {
            margin-bottom: 20px;
            color: #666;
          }
          .file-list {
            list-style: none;
            padding: 0;
          }
          .file-list li {
            margin: 5px 0;
            padding: 10px;
            border-radius: 4px;
            background-color: #f5f5f5;
          }
          .file-list li:hover {
            background-color: #e6f7ff;
          }
          .file-list a {
            display: block;
            text-decoration: none;
            color: #333;
          }
          .file-list .directory {
            font-weight: bold;
            color: #1890ff;
          }
          .file-list .glb-file {
            color: #52c41a;
          }
          .links {
            margin-top: 20px;
            padding: 10px;
            background-color: #f0f0f0;
            border-radius: 4px;
          }
          .links a {
            margin-right: 10px;
            color: #1890ff;
          }
        </style>
      </head>
      <body>
        <h1>目录: ${urlPath}</h1>
        <div class="breadcrumb">
          <a href="/">根目录</a> &gt; ${
            urlPath.split('/')
              .filter(p => p)
              .map((p, i, arr) => {
                const path = '/' + arr.slice(0, i + 1).join('/');
                return `<a href="${path}">${p}</a>`;
              })
              .join(' &gt; ')
          }
        </div>
        
        <div class="links">
          <a href="/simple-viewer.html">简化版模型查看器</a>
          <a href="/direct-test.html">直接测试页面</a>
          <a href="/viewer.html">标准模型查看器</a>
          <a href="/listExport">模型API(JSON)</a>
          <a href="/health">健康检查</a>
        </div>
        
        <ul class="file-list">
          ${
            urlPath !== '/' ? 
            `<li><a href="${path.dirname(urlPath)}" class="directory">↩ 返回上级目录</a></li>` : 
            ''
          }
          ${
            entries
              .sort((a, b) => {
                // 先显示目录，再显示文件
                if (a.isDirectory() && !b.isDirectory()) return -1;
                if (!a.isDirectory() && b.isDirectory()) return 1;
                return a.name.localeCompare(b.name);
              })
              .map(entry => {
                const entryPath = path.join(urlPath, entry.name);
                const isGlb = entry.name.toLowerCase().endsWith('.glb');
                let className = entry.isDirectory() ? 'directory' : (isGlb ? 'glb-file' : '');
                return `
                  <li>
                    <a href="${entryPath}" class="${className}">
                      ${entry.isDirectory() ? '📁 ' : (isGlb ? '🌳 ' : '📄 ')}
                      ${entry.name}
                    </a>
                  </li>
                `;
              })
              .join('')
          }
        </ul>
      </body>
      </html>
    `;
    
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
}

// 列出模型文件API
function listModels(res) {
  const modelExts = ['.glb', '.gltf'];
  
  // 递归查找目录中的所有模型文件
  function findModels(dir, baseDir = '') {
    let results = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(baseDir, entry.name);
        
        if (entry.isDirectory()) {
          results = results.concat(findModels(fullPath, relativePath));
        } else {
          const ext = path.extname(entry.name).toLowerCase();
          if (modelExts.includes(ext)) {
            results.push(relativePath);
          }
        }
      }
    } catch (err) {
      console.error(`读取目录失败: ${dir}, 错误: ${err.message}`);
    }
    
    return results;
  }
  
  try {
    const modelFiles = findModels(MODELS_DIR);
    
    if (DEBUG) {
      console.log(`找到 ${modelFiles.length} 个模型文件:`);
      modelFiles.forEach(file => console.log(` - ${file}`));
    }
    
    // 返回模型文件列表
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      files: modelFiles
    }));
  } catch (err) {
    console.error('列出模型时发生错误:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: err.message
    }));
  }
}

process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
});

// 处理SIGINT信号（Ctrl+C）
process.on('SIGINT', () => {
  console.log('服务器关闭中...');
  server.close(() => {
    console.log('服务器已安全关闭');
    process.exit(0);
  });
}); 