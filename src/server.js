require('dotenv').config();
const path = require('path');
const { initProjects, startProjectServer } = require('./utils/projects');
const SOURCE_DIR_NAME = path.join(__dirname, process.env.SOURCE_DIR_NAME || 'projects');


(async () => {
    const { projects } = await initProjects(SOURCE_DIR_NAME);
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
        });
    }
})();


