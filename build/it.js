'use strict';

const child_process = require('child_process');
const assert = require('assert');
const path = require('path');
const node_fs = require('fs');

const fn = require('ndk.fn');
const ndk_fs = require('ndk.fs');

const rootPath = path.resolve(__dirname, '../');

module.exports.readImage = readImage;
module.exports.readResources = readResources;
module.exports.exec = exec;

function readImage(file) {
   assert.strictEqual(typeof file, 'string');
   return new Promise((resolve, reject) => {
      node_fs.readFile(path.join(rootPath, file), 'base64', (err, data) => {
         if (err) {
            reject(err);
         } else {
            let ext = path.extname(file);
            ext = ext.slice(-ext.length + 1);
            resolve(`data:image/${ext};base64,${data}`);
         }
      });
   });
}

function readResources(dir) {
   assert.strictEqual(typeof dir, 'string');
   return fn.execute(function* () {
      var files = yield ndk_fs.readDir(dir);
      var resources = '\n';
      for (let i = 0; i < files.length; i++) {
         let file = files[i];
         let name = path.basename(file, path.extname(file));
         let resource = yield ndk_fs.readText(path.join(dir, file));
         resource = resource
            .replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\${/g, '\\${');
         resources += `'${name}':\`\n${resource}\n\``;
         if (i < files.length - 1) {
            resources += ',\n';
         }
      }
      return '{' + resources + '}';
   });
}

function exec(command, silence) {
   return new Promise((resolve, reject) => {
      if (!silence) {
         console.log(command);
      }
      child_process.exec(command, {
         cwd: exec.cwd || path.resolve(__dirname, '../')
      }, (err, stdout) => {
         if (err) {
            reject(err);
         } else {
            let msg = stdout.trim();
            if (msg && !silence) {
               console.log(msg);
            }
            resolve(msg);
         }
      });
   });
}