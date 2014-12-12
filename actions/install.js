var path = require('path'),
    file = require('../file'),
    fs = require('fs');

module.exports = function(program, config) {
    var command = program.command('install <name> <dir> [webdir]')
    .description('Install a new instance.')
    .action(function(name, dir, webdir) {

        var dest = path.join(dir, name);
        var master = path.join(__dirname, '../.data/instance');

        // don't allow overwriting instance keys
        if (config.instances[name]) {
            console.error('Instance already installed under that key: ' + config.instances[name].path);
            return process.exit(1);
        }

        // don't allow overwriting anything on file
        if (fs.existsSync(dest)) {
            console.error('Path `' + dest + '` is not empty.');
            return process.exit(1);
        }

        file.copy(master, dest)()
            .then(file.prompt(dest, 'php', ['composer.phar', 'run-script', 'post-install-cmd', '--dev']))
            .then(file.run(dest, './app/console', ['doctrine:database:create']))
            .then(file.run(dest, './app/console', ['doctrine:migrations:migrate', '--no-interaction']))
            .then(file.run(dest, './app/console', ['bio:install', '--no-clear']))
            .then(file.run(dest, './app/console', ['assets:install', '--symlink']))
            .then(file.run(dest, './app/console', ['assetic:dump', '--env=prod']))
            .then(file.run(dest, 'chmod', ['-R', '777', 'app/cache', 'app/logs', 'web/files', 'web/bundles']))
            .then(file.run(dest, './app/console', ['cache:clear', '--env=prod']))
            .then(function() {
                console.log('Instance installed.');

                // this will be persisted on exit
                config.instances[name] = {
                    path: dest,
                    webdir: webdir ? webdir : null,
                    created: Date.now(),
                    updated: Date.now()
                };
            }).catch(function(err) {
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
