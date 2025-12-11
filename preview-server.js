#!/usr/bin/env node

/**
 * 本地预览服务器
 * 支持静态文件和目录索引
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const DIST_DIR = path.join(__dirname, 'dist');

// MIME 类型映射
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.sh': 'text/plain'
};

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
    // 解码 URL（处理中文等特殊字符）
    let requestPath = decodeURIComponent(req.url);

    // 移除查询参数
    requestPath = requestPath.split('?')[0];

    // 构建文件路径
    let filePath = path.join(DIST_DIR, requestPath);

    // 如果请求的是目录，尝试加载 index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    // 检查文件是否存在
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 404 - 文件不存在
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>404 - 页面未找到</title>
                        <style>
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                            }
                            .error-box {
                                text-align: center;
                                padding: 40px;
                                background: rgba(255,255,255,0.1);
                                border-radius: 20px;
                                backdrop-filter: blur(10px);
                            }
                            h1 { font-size: 72px; margin: 0; }
                            p { font-size: 20px; margin: 20px 0; }
                            a { color: white; text-decoration: none; border-bottom: 2px solid white; }
                        </style>
                    </head>
                    <body>
                        <div class="error-box">
                            <h1>404</h1>
                            <p>页面未找到: ${requestPath}</p>
                            <a href="/">返回首页</a>
                        </div>
                    </body>
                    </html>
                `);
            } else {
                // 500 - 服务器错误
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`服务器错误: ${err.code}`);
            }
        } else {
            // 200 - 成功
            const mimeType = getMimeType(filePath);
            res.writeHead(200, {
                'Content-Type': `${mimeType}; charset=utf-8`,
                'Cache-Control': 'no-cache'
            });
            res.end(data);

            // 日志
            const timestamp = new Date().toLocaleTimeString('zh-CN');
            console.log(`[${timestamp}] ${req.method} ${requestPath} -> ${filePath.replace(DIST_DIR, '')}`);
        }
    });
});

server.listen(PORT, () => {
    console.log('\n========================================');
    console.log('   🚀 镜像加速站 - 本地预览服务器');
    console.log('========================================\n');
    console.log(`📡 服务器已启动`);
    console.log(`🌐 访问地址: http://localhost:${PORT}`);
    console.log(`📁 文件目录: ${DIST_DIR}\n`);
    console.log('按 Ctrl+C 停止服务器\n');
});

// 优雅退出
process.on('SIGINT', () => {
    console.log('\n\n👋 服务器已关闭');
    process.exit(0);
});
