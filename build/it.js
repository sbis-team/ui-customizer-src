'use strict';

const fn = require('ndk.fn');

const child_process = require('child_process');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const GeneratorFunction = (function* () { yield; }).constructor;
const Generator = (function* () { yield; })().constructor;

const rootPath = path.resolve(__dirname, '../');

const parse_regexp = /^[A-Z0-9]+$/;
const parse_depthRegexp = /\/\*[A-Z0-9]+\*\//;
const parse_depthMax = 1000;

module.exports.parse = parse;
module.exports.read = read;
module.exports.readJSON = readJSON;
module.exports.readImage = readImage;
module.exports.mkdir = mkdir;
module.exports.write = write;
module.exports.writeJSON = writeJSON;
module.exports.readdir = readdir;
module.exports.readResources = readResources;
module.exports.exec = exec;

function parse(tmpl, data) {
   assert.strictEqual(typeof tmpl, 'string');
   assert.strictEqual(typeof data, 'object');
   return fn.execute(function* () {
      var depth = {};
      var fromIndex = yield tmpl.indexOf('/*');
      while (~fromIndex) {
         let keyIndex = fromIndex + 2;
         let toIndex = tmpl.indexOf('*/', keyIndex);
         let key = tmpl.substring(keyIndex, toIndex);
         let inKeyIndex = key.indexOf('/*');
         if (~inKeyIndex) {
            fromIndex = keyIndex + inKeyIndex;
         } else if (parse_regexp.test(key) && key in data) {
            let rdata = data[key];
            if (parse_depthRegexp.test(rdata)) {
               if (!(key in depth)) {
                  depth[key] = 0;
               }
               if (++depth[key] > parse_depthMax) {
                  throw Error('Превышена глубина рекурсии для шаблонизатора по ключу: ' + key);
               }
            }
            tmpl = tmpl.substring(0, fromIndex) + rdata + tmpl.substring(toIndex + 2);
         } else {
            fromIndex = toIndex + 2;
         }
         fromIndex = yield tmpl.indexOf('/*', fromIndex);
      }
      return tmpl;
   });
}

function read(file) {
   assert.strictEqual(typeof file, 'string');
   return new Promise((resolve, reject) => {
      fs.readFile(path.join(rootPath, file), 'utf8', (err, data) => {
         if (err) {
            reject(err);
         } else {
            resolve(data);
         }
      });
   });
}

function readJSON(file, default_data) {
   assert.strictEqual(typeof file, 'string');
   return new Promise((resolve, reject) => {
      fs.readFile(path.join(rootPath, file), 'utf8', (err, data) => {
         if (err) {
            if (typeof default_data === 'object') {
               resolve(default_data);
            } else {
               reject(err);
            }
         } else {
            resolve(JSON.parse(data));
         }
      });
   });
}

function readImage(file) {
   assert.strictEqual(typeof file, 'string');
   return new Promise((resolve, reject) => {
      fs.readFile(path.join(rootPath, file), 'base64', (err, data) => {
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

function mkdir(dir) {
   return new Promise((resolve) => {
      fs.mkdir(path.join(rootPath, dir), () => resolve());
   });
}

function write(file, data) {
   assert.strictEqual(typeof file, 'string');
   assert.strictEqual(typeof data, 'string');
   return new Promise((resolve, reject) => {
      fs.writeFile(path.join(rootPath, file), data, 'utf8', (err) => {
         if (err) {
            reject(err);
         } else {
            resolve();
         }
      });
   });
}

function writeJSON(file, data) {
   assert.strictEqual(typeof file, 'string');
   assert.strictEqual(typeof data, 'object');
   data = JSON.stringify(data, null, '   ');
   return write(file, data);
}

function readdir(dir) {
   assert.strictEqual(typeof dir, 'string');
   return new Promise((resolve, reject) => {
      fs.readdir(path.join(rootPath, dir), (err, files) => {
         if (err) {
            reject(err);
         } else {
            resolve(files);
         }
      });
   });
}

function readResources(dir) {
   assert.strictEqual(typeof dir, 'string');
   return fn.execute(function* () {
      var files = yield readdir(dir);
      var resources = '\n';
      for (let i = 0; i < files.length; i++) {
         let file = files[i];
         let name = path.basename(file, path.extname(file));
         let resource = yield read(path.join(dir, file));
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
            let msg = stdout.replace(/^[\r\n\s]/, '').replace(/[\r\n\s]$/, '');
            if (msg && !silence) {
               console.log(msg);
            }
            resolve(msg);
         }
      });
   });
}