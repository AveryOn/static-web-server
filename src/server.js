require('dotenv').config();
const path = require('path');
const { initProjects, startProjectServer } = require('./utils/projects');
const PUBLIC_DIR = path.join(__dirname, 'projects');


(async () => {
    const { projects } = await initProjects(PUBLIC_DIR);
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


