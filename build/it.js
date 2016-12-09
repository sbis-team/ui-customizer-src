'use strict';

const path = require('path');

const ndk_fn = require('ndk.fn');
const ndk_fs = require('ndk.fs');

module.exports.readSources = readSources;

function readSources(dir) {
   return ndk_fn.execute(function* () {
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
