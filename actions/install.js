var path = require('path'),
    file = require('../file');

module.exports = function(program, config) {
    var command = program.command('install [name] [dir]')
    .description('Install a new instance.')
    .action(function(name, dir) {

        var dest = path.join(dir, name);
        var master = path.join(__dirname, '../.data/instance');

        file.copy(master, dest)()
            .then(file.prompt(dest, 'php', ['composer.phar', 'run-script', 'post-install-cmd', '--dev']))
            .then(file.run(dest, './app/console', ['doctrine:migrations:migrate', '--no-interaction']))
            .then(file.run(dest, './app/console', ['bio:install', '--no-clear']))
            .then(file.run(dest, './app/console', ['assets:install', '--symlink']))
            .then(file.run(dest, './app/console', ['assetic:dump', '--env=prod']))
            .then(file.run(dest, './app/console', ['bio:setup', '--no-account']))
            .then(file.run(dest, 'chmod', ['-R', '777', 'app/cache', 'app/logs', 'web/files', 'web/bundles']))
            .then(file.run(dest, './app/console', ['cache:clear', '--env=prod']))
            .then(function() {
                console.log('Instance installed.');
            }, function(err) {
                console.log('Could not install new instance.');
                console.log(err);

                return file.remove(dest)();
            })
            .catch(function(err) {
                console.log('FATAL ERROR');
                console.log(err);
            });
    });
};
