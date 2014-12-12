var _ = require('lodash');

module.exports = function(program, config) {

    var command = program.command('list')
    .description('Lists all installed instances.')
    .option('-v, --verbose', 'Show more data.')
    .action(function() {

        var instances = config.instances;

        if (!_.size(instances)) {
            console.log('There are no instances installed.');
        }

        _.each(instances, function(instance, key) {
            console.log(key);
            if (command.verbose) {
                console.log('  path:    ', instance.path);
                console.log('  webRoot: ', instance.webRoot || instance.path + '/web');
                console.log('  created: ', instance.created);
                console.log('  updated: ', instances.updated);
                console.log();
            }
        });

    });

}
