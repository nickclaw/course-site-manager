var _ = require('lodash');

/**
 * List all current instances
 */
module.exports = function(program, config, env) {

    var command = program.command('list [key]')
    .description('Lists all installed instances.')
    .option('-v, --verbose', 'Show more data.')
    .action(function(key) {

        var instances = config.instances;

        if (!_.size(instances)) {
            console.log('There are no instances installed.');
            return;
        }

        if (key) {
            if (!instances[key]) {
                console.log('No instance installed named: ' + key);
                return;
            } else {
                var instance = instances[key];
                instances = {};
                instances[key] = instance;
                command.verbose = true;
            }
        }

        _.each(instances, function(instance, key) {
            console.log(key);
            if (command.verbose) {
                console.log('  path:    ', instance.path);
                console.log('  webRoot: ', instance.webdir);
                console.log('  created: ', instance.created);
                console.log('  updated: ', instance.updated);
                console.log('  behind master by: ', instance.behind);
                console.log();
            }
        });

    });

}
