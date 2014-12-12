var Promise = require('bluebird'),
    path = require('path'),
    file = require('../file');

module.exports = function(program, config) {

    program.command('update <key>')
    .description('Update a course-site instance with the master instance.')
    .action(function(key) {

        var instance = config.instances[key];
        if (!instance) {
            return console.log('Unknown instance: ' + key);
        }

        var data = path.join(__dirname, '../.data');
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
            .then(file.copy(master, dest))
            .then(file.remove(path.join(dest, 'app/config/parameters.yml')))
            .then(file.copy(
                path.join(tmp, 'app/config/parameters.yml'),
                path.join(dest, 'app/config/parameters.yml')
            ))
            .catch(function(err) {
                console.log('Could not safely copy master instance.');
                return Promise.reject(err);
            })
            .then(file.run(dest, 'php', ['./app/console', 'bio:update']))
            .then(function() {
                console.log('New instance installed: ' + dest);
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
