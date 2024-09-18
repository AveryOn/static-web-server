const http = require('http');
const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');
const { MIMEtypes, checkPort } = require('./config');

module.exports = {
    // Инициализация проектов
    initProjects: (PUBLIC_DIR) => {
        return new Promise((resolve, reject) => {
            fs.readdir(PUBLIC_DIR, { encoding: 'utf-8', withFileTypes: true }, (err, files) => {
                if(err) {
                    return reject(err);
                }
                const dirs = [];
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if(file.isDirectory()) {
                        dirs.push({
                            name: file.name,
                            path: file.parentPath,
                            ownerPath: file.parentPath += `/${file.name}`,
                        });
                    }
                }
                resolve({ projects: dirs });
            })
        });
    },

    // Запустить сервер для экземпляра проекта
    startProjectServer: async (PROJECT_DIR, PROJECT_NAME) =>  {
        let PORT = process.env.PORT || 3000;

        // Проверяем доступность порта, пока он не будет свободен
        while (!(await checkPort(PORT))) {
            PORT++;
        }

        const server = http.createServer((req, res) => {
            const filePath = path.join(PROJECT_DIR, req.url === '/' ? 'index.html' : req.url);
            const extname = path.extname(filePath);
            const contentType = MIMEtypes[extname] || 'text/html';

            fs.readFile(filePath, (err, content) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        // Если файл не найден, отправляем index.html
                        fs.readFile(path.join(PROJECT_DIR, 'index.html'), (indexErr, indexContent) => {
                            if (indexErr) {
                                res.writeHead(500);
                                res.end('Internal Server Error: ' + indexErr.code, 'utf-8')
                            } else {
                                res.writeHead(200, { 'Content-Type': 'text/html' });
                                res.end(indexContent, 'utf-8');
                            }
                        });
                    } else {
                        res.writeHead(500);
                        res.end('Internal Server Error: ' + err.code, 'utf-8');
                    }
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            });
        });

        server.listen(PORT, () => {
            logger(`Project "${PROJECT_NAME}" http://localhost:${PORT}`);
        });
    },
}