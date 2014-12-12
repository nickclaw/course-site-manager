var program = require('commander');
var fs = require('fs');
var path = require('path');

var config = require(__dirname + '/.data/store.json');

program.version('1.0.0');
require('./actions/list')(program, config);
require('./actions/pull')(program, config);
require('./actions/update')(program, config);
require('./actions/install')(program, config);
program.parse(process.argv);

process.on('exit', function(code) {
    if (!code) {
        try {
            if (fs.existsSync(__dirname + '/.data/~store.json')) {
                fs.unlinkSync(__dirname + '/.data/~store.json');
            }

            fs.renameSync(__dirname + '/.data/store.json', __dirname + '/.data/~store.json');
            fs.writeFileSync(__dirname + '/.data/store.json', JSON.stringify(config, null, 4));
        } catch (e) {
            console.log('FATAL ERROR');
            console.log('Check .data/store.json');
        }
    }
});