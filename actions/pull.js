var path = require('path'),
    file = require('../file');

module.exports = function(program, config) {

    var command = program.command('pull')
    .description('Pull in and build the master course-site.')
    .option('-b, --branch [branch]', 'Pull in the specified branch [master]', 'master')
    .option('-c, --commit <commit>', 'Pull in a specific commit.')
    .action(function() {

        var data = path.join(__dirname, '../.data');
        var cwd = path.join(data, 'instance');
        var tmp = path.join(data, 'old_instance');

        file.remove(tmp)()
            .catch(function(){ /* file not there */ })
            .then(file.rename(cwd, tmp))
            .catch(function(){ /* file not there */ })
            .then(file.run(data, 'git', ['clone', 'https://github.com/dmhurley/course-site.git', 'instance']))
            .then(file.run(cwd, 'chmod', ['-R', '777', 'app/cache', 'app/logs', 'web/files']))
            .then(file.run(cwd, 'curl', ['-O', 'http://getcomposer.org/installer']))
            .then(file.run(cwd, 'php', ['installer']))
            .then(file.run(cwd, 'php', ['composer.phar', 'install']))
            .then(file.remove(path.join(cwd, 'app/config/parameters.yml')))
            .then(function() {
                console.log('New master instance installed.');
            }, function(err) {
                console.log('Unable to install new master instance.');
                console.log(err);
                return file.remove(cwd)()
                    .then(file.rename(tmp, cwd));
            })
            .catch(function(err) {
                console.log('FATAL ERROR', err);
            });
    });
};
