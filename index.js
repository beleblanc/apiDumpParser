var fs = require('fs');
var path = require('path');
var _ = require('lodash');

process.argv.shift(); //dump node process string
process.argv.shift(); //dump process file name (this file)

if (process.argv.length < 1) {
    console.log("Insufficient arguments, minimum of one required. \n`node index.js {dumpFileLocation} {?pathToCreateApiStructure} ")
}

var filePath = process.argv.shift(); //get the file path
var structurePath = process.argv.shift() || 'dump'; //where are we dumping the output too
var apiDump = {};

fs.readFile(filePath, 'utf8',function(err, buffer){
    if (err) {
        console.log(err.code+': '+ err.message);
        throw err;
    }
    if (buffer) {
        apiDump = JSON.parse(buffer);
        readAndCreateTree(apiDump, structurePath);
    }
    else {
        console.log('Provide a valid file');
        process.exit();
    }

});


function readAndCreateTree(object, currentTreeLocation) {
    _.forEach(object, function(obj, key){
        //chek to create if directory exists, if it doesn't create it
        if (_.includes(['GET', 'POST', 'PUT', 'DELETE'], key)) {
            console.log(currentTreeLocation);

            makeParentDirectory(currentTreeLocation, undefined, function(err) {
                fs.writeFile(currentTreeLocation + '/' + key + '.json', JSON.stringify(obj), function(err) {
                console.log('writeFile:', err);
                });
            });

        } else {
            readAndCreateTree(obj, currentTreeLocation + '/'+ key);
        }

    });
}

function createDirectory(dir, changeDir) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);

    }
    if (changeDir) {
       changeDirectory(dir)
    }
}

function changeDirectory(dir) {
    try {
        process.chdir(dir);
        console.log('New directory: ', process.cwd());
    }
    catch (err) {
        console.log('chdir: ', err);
    }
}

//Taken from http://lmws.net/making-directory-along-with-missing-parents-in-node-js

function makeParentDirectory(dirPath, mode, callback) {
    //Call the standard fs.mkdir
    fs.mkdir(dirPath, mode, function(error) {
        //When it fail in this way, do the custom steps
        if (error && error.errno === -2) {
            //Create all the parents recursively
            makeParentDirectory(path.dirname(dirPath), mode, callback);
            //And then the directory
            makeParentDirectory(dirPath, mode, callback);
        }
        else {
            console.log(dirPath);
        }
    //Manually run the callback since we used our own callback to do all these
        callback && callback(error);
    });
}