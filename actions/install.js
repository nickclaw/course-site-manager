var path = require('path'),
    file = require('../file'),
    fs = require('fs');

/**
 * Install a new instance, copying the current masters state
 */
module.exports = function(program, config, env) {
    var command = program.command('install <name> <dir> [webdir]')
    .description('Install a new instance.')
    .action(function(name, dir, webDir) {

        webDir = webDir || env.webDir;

        var dest = path.join(process.cwd(), dir, name);
        var master = path.join(env.dataPath, 'instance');

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
                if (webDir) {
                    return file.symlink(
                        path.join(dest, 'web/'),
                        path.join(webDir, name)
                    )();
                } else {
                    console.log('Did not install into web directory.');
                }
            })
            .then(function() {
                console.log('Instance installed.');

                // this will be persisted on exit
                config.instances[name] = {
                    path: dest,
                    webdir: webDir ? path.join(webDir, name) : null,
                    created: Date.now(),
                    updated: Date.now(),
                    behind: 0
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
