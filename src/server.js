const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PUBLIC_DIR = path.join(__dirname, 'projects');

let MIMEtypes = {
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
}

// Функция для проверки доступности порта
const checkPort = (port) => {
    return new Promise((resolve) => {
        const server = http.createServer();
        server.listen(port, () => {
            server.close(() => resolve(true));
        });
        server.on('error', () => resolve(false));
    });
};

// Инициализация проектов
function initProjects() {
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
}


(async () => {
    const { projects } = await initProjects();
    if(Array.isArray(projects)) {
        projects.forEach((project) => {
            if(project.ownerPath) {
                startProjectServer(project.ownerPath, project.name);
            }
            else {
                let errName = `Project "${project.name}" is not exists`;
                console.error(errName);
                throw errName;
            }
        })
    }
})();


async function logger(...args) {
    const chalk = (await import('chalk')).default;
    console.log(chalk.bold.hex('#1de595')(...args));
}

// Запустить сервер для экземпляра проекта
async function startProjectServer(PROJECT_DIR, PROJECT_NAME) {
    let PORT = process.env.PORT || 3000;

    // Проверяем доступность порта, пока он не будет свободен
    while (!(await checkPort(PORT))) {
        PORT++;
    }

    const server = http.createServer((req, res) => {
        let filePath = path.join(PROJECT_DIR, req.url === '/' ? 'index.html' : req.url);
        const extname = path.extname(filePath);

        let contentType = MIMEtypes[extname] || 'text/html';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // Если файл не найден, отправляем index.html
                    fs.readFile(path.join(PROJECT_DIR, 'index.html'), (indexErr, indexContent) => {
                        if (indexErr) {
                            res.writeHead(500);
                            res.end('Ошибка сервера: ' + indexErr.code);
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(indexContent, 'utf-8');
                        }
                    });
                } else {
                    res.writeHead(500);
                    res.end('Ошибка сервера: ' + err.code);
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
};
