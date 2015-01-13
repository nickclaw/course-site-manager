var Promise = require('bluebird'),
    path = require('path'),
    file = require('../file');

/**
 * Update an existing instance with the master instance
 */
module.exports = function(program, config, env) {

    program.command('update <key>')
    .description('Update a course-site instance with the master instance.')
    .action(function(key) {

        var instance = config.instances[key];
        if (!instance) {
            return console.log('Unknown instance: ' + key);
        }

        var data = env.dataPath;
        var tmp = path.join(data, 'tmp', key);
        var master = path.join(data, 'instance');
        var dest = instance.path;

        file.remove(tmp)()
            .catch(function() { /* no file */ })
            .then(file.rename(dest, tmp))
            .catch(function(err) {
                console.log('Could not safely store current instance.');
                console.error(err);
                process.exit(0);
            })

            // copy master to destination
            .then(file.copy(master, dest))

            // copy old parameters
            .then(file.remove(path.join(dest, 'app/config/parameters.yml')))
            .then(file.copy(
                path.join(tmp, 'app/config/parameters.yml'),
                path.join(dest, 'app/config/parameters.yml')
            ))

            // copy old files
            .then(file.remove(path.join(dest, 'web/files')))
            .then(file.copy(
                path.join(tmp, 'web/files'),
                path.join(dest, 'web/files')
            ))
            .catch(function(err) {
                console.log('Could not safely copy master instance.');
                return Promise.reject(err);
            })
            .then(file.run(dest, 'php', ['./app/console', 'bio:update']))
            .then(file.run(dest, 'chmod', ['-R', '777', 'app/cache', 'app/logs', 'web/files']))
            .then(function() {
                console.log('Instance updated ' + dest);
                instance.behind = 0;
                instance.updated = Date.now();
            }, function(err) {
                console.log('New instance was not installed.');
                return file.remove(dest)()
                    .then(file.rename(tmp, dest));
            })
            .catch(function(err) {
                console.error('FATAL ERROR');
                console.error(err);
            });
    });
};
