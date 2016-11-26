"use strict";

const assert = require('assert');

const fn = require('ndk.fn');

const parse_regexp = /^[A-Z0-9]+$/;
const parse_depthRegexp = /\/\*[A-Z0-9]+\*\//;
const parse_depthMax = 1000;

var _mode = 'development';
if (~process.argv.indexOf('--rc')) {
   _mode = 'candidate';
} else if (~process.argv.indexOf('--r')) {
   _mode = 'release';
}

module.exports.mode = _mode;

module.exports.parse = parse;
module.exports.setBuild = setBuild;
module.exports.setVersion = setVersion;
module.exports.getVersionName = getVersionName;
module.exports.getDateTime = getDateTime;
module.exports.getDisplayDateTime = getDisplayDateTime;
module.exports.minimize = minimize;
module.exports.getVerInfo = getVerInfo;

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

function setBuild(data) {
   if (!('number' in data)) {
      data.number = 0;
   }
   data.number += 1;
   return data;
}

function setVersion(version, notes) {
   if (notes.added.length) {
      version.minor += 1;
      version.patch = 0;
   } else {
      version.patch += 1;
   }
   return version;
}

function getVersionName(version, build) {
   var ver = `${version.major}.${version.minor}.${version.patch}`;
   switch (_mode) {
      case 'development':
         return `${ver}.dev${build.number}`;
      case 'candidate':
         return `${ver}.rc${build.number}`;
      default:
         return ver;
   }
}

function getDateTime(date) {
   date = date || new Date();
   return date.getFullYear() + '-' +
      ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
      ('0' + date.getDate()).slice(-2) + 'T' +
      ('0' + date.getHours()).slice(-2) + ':' +
      ('0' + date.getMinutes()).slice(-2) + ':' +
      ('0' + date.getSeconds()).slice(-2);
}

function getDisplayDateTime(date) {
   date = date || new Date();
   return ('0' + date.getDate()).slice(-2) + '.' +
      ('0' + (date.getMonth() + 1)).slice(-2) + '.' +
      date.getFullYear() + ' ' +
      ('0' + date.getHours()).slice(-2) + ':' +
      ('0' + date.getMinutes()).slice(-2) + ':' +
      ('0' + date.getSeconds()).slice(-2);
}

function minimize(script) {
   if (~process.argv.indexOf('--minimize')) {
      script = script.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\t+/g, ' ').replace(/ +/g, ' ');
   }
   return script;
}

function getVerInfo(scriptData, notes) {
   return JSON.stringify({
      version: scriptData.VERSION,
      date: scriptData.DISPLAYDATE,
      notes: {
         added: notes.added,
         changed: notes.changed,
         fixed: notes.fixed,
         issues: notes.issues
      }
   }, null, '   ');
}
