var path = require('path'),
    file = require('../file');

module.exports = function(program, config, env) {
    var commmand = program.command('add <name> <dir> [webdir]')
    .description('Add an existing instance to the store.')
    .action(function(name, dir, webDir) {

        dir = path.resolve(process.cwd(), dir);
        webDir = webDir || env.webDir;
        if (webDir) {
            webDir = path.resolve(process.cwd(), webDir);
        }

        if (config.instances[name]) {
            console.log('Instance `' + name + '` already exists in store.json');
            process.exit(1);
        }

        file.exists(dir)()
            .then(file.exists(path.join(dir, 'app/config/parameters.yml')))
            .then(file.exists(path.join(dir, 'web')))
            .catch(function(err) {
                console.log('Given directory does not appear to be a course-site instance.');
                console.log(err);
                process.exit(1);
            })
            .then(function() {
                config.instances[name] = {
                    path: dir,
                    webdir: webDir,
                    created: Date.now(),
                    upated: null,
                    behind: 100000
                };
            });
    });
};
