const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8000;
const rootDir = path.join(__dirname);

const server = http.createServer((req, res) => {
    // 忽略查询参数
    const cleanUrl = req.url.split('?')[0];
    let filePath = path.join(rootDir, cleanUrl === '/' ? 'index.html' : cleanUrl);
    
    // 检查文件是否存在
    fs.exists(filePath, (exists) => {
        if (!exists) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }
        
        // 检查是否是目录
        fs.stat(filePath, (err, stats) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
                return;
            }
            
            if (stats.isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            }
            
            // 读取文件
            fs.readFile(filePath, 'utf8', (err, content) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end('500 Internal Server Error');
                    return;
                }
                
                // 设置Content-Type
                const extname = path.extname(filePath);
                let contentType = 'text/html; charset=utf-8';
                switch (extname) {
                    case '.js':
                        contentType = 'text/javascript; charset=utf-8';
                        break;
                    case '.css':
                        contentType = 'text/css; charset=utf-8';
                        break;
                    case '.json':
                        contentType = 'application/json; charset=utf-8';
                        break;
                    case '.jpg':
                        contentType = 'image/jpeg';
                        break;
                    case '.png':
                        contentType = 'image/png';
                        break;
                    case '.gif':
                        contentType = 'image/gif';
                        break;
                }
                
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            });
        });
    });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log('Press Ctrl+C to stop the server');
});