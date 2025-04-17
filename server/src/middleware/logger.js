/**
 * 日志中间件
 * 用于记录API请求和响应
 */

/**
 * 请求日志中间件
 * 记录请求信息和响应
 */
export const loggerMiddleware = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('请求头:', req.headers);
  
  // 记录原始URL和查询参数
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('原始查询参数:', req.originalUrl);
    // 遍历所有查询参数并单独打印
    for (const [key, value] of Object.entries(req.query)) {
      console.log(`查询参数 ${key}:`, value);
      // 对于可能包含中文的参数，打印其编码后的值
      if (typeof value === 'string') {
        console.log(`${key} 的编码值:`, Buffer.from(value).toString('hex'));
        console.log(`${key} 的解码值:`, decodeURIComponent(value));
      }
    }
  }
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('请求体:', JSON.stringify(req.body, null, 2));
  }
  
  // 记录响应
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`${new Date().toISOString()} - 响应状态: ${res.statusCode}`);
    console.log('响应体:', body);
    return originalSend.call(this, body);
  };
  
  next();
}; 