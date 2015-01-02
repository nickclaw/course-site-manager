var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    rimraf = require('rimraf'),
    spawn = require('child_process').spawn,
    _ = require('lodash'),
    ncp = require('ncp').ncp;

function rename(src, dest) {
    return function() {
        console.log('Renaming: ' + src + ' -> ' + dest);
        return fs.renameAsync(src, dest);
    };
}

function remove(src) {
    return function() {
        console.log('Removing: ' + src);
        return new Promise(function(res, rej) {
            rimraf(src, function(err) {
                if (err) return rej(err);
                res();
            });
        });
    };
}

function run(cwd, command, args) {
    return function() {
        console.log('Running: ' + command + ' ' + args.join(' '));
        return runProcess(command, args, {
            cwd: cwd
        });
    };
}

function prompt(cwd, command, args) {
    return function() {
        console.log('Running: ' + command + ' ' + args.join(' '));
        return runProcess(command, args, {
            cwd: cwd,
            stdio: [process.stdin, 'pipe', 'pipe']
        });
    };

}

function copy(src, dest) {
    return function() {
        console.log('Copying: ' + src + ' -> ' + dest);
        return new Promise(function(res, rej) {
            ncp(src, dest, function(err) {
                if (err) return rej(err);
                res();
            });
        });
    };
}

function symlink(src, dest) {
    return function() {
        console.log('Symlinking: ' + src + ' -> ' + dest);
        return new Promise(function(res, rej) {
            fs.symlink(src, dest, function(err) {
                if (err) return rej(err);
                res();
            });
        });
    };
}

function runProcess(command, args, options) {
    return new Promise(function(res, rej) {
        var ps = spawn(command, args, options);
        ps.stdout.on('data', function(data) {
            var strings = data.toString().trim().split('\n');
            strings.forEach(function(string) {
                console.log('    \033[0;90m' + string + '\033[0m');
            });
        });
        ps.stderr.on('data', function(data) {
            var strings = data.toString().trim().split('\n');
            strings.forEach(function(string) {
                console.log('    \033[0;31m' + string + '\033[0m');
            });
        });
        ps.on('error', function(err) {
            rej(err);
        });
        ps.on('close', function(code) {
            if (code !== 0) {
                rej(code);
            } else {
                res(code);
            }
        });
    });
}

module.exports = {
    rename: rename,
    remove: remove,
    prompt: prompt,
    copy: copy,
    run: run,
    symlink: symlink
};
