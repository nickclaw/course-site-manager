var program = require('commander');
var fs = require('fs');
var path = require('path');

var webDir = process.env.CSM_WEBDIR || null;
var dataPath = process.env.CSM_DATA;
var configPath = path.join(dataPath, 'store.json');
var backupPath = path.join(dataPath, '~store.json');

// check process.env for CSM_DATA
if (!dataPath) {
    console.log('`CSM_DATA` path is not present in environment.');
    process.exit(1);
}

// build data folder if it doesn't exist
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
}

// build store.json if it doesn't exist
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({
        created: Date.now(),

        /* information about each instance */
        instances: {}
    }, null, 4));
}

// require the config file
var config = require(configPath);

var env = {
    dataPath: dataPath,
    webDir: webDir
};

program.version('1.0.0');
require('./actions/list')(program, config, env);
require('./actions/pull')(program, config, env);
require('./actions/update')(program, config, env);
require('./actions/install')(program, config, env);
program.parse(process.argv);

process.on('exit', function(code) {
    if (!code) {
        try {
            if (fs.existsSync(backupPath)) {
                fs.unlinkSync(backupPath);
            }

            fs.renameSync(configPath, backupPath);
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        } catch (e) {
            console.log('FATAL ERROR');
            console.log('Check ' + configPath);
        }
    }
});
