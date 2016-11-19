"use strict";

var _mode = 'development';
if (~process.argv.indexOf('--rc')) {
   _mode = 'candidate';
} else if (~process.argv.indexOf('--r')) {
   _mode = 'release';
}

module.exports.mode = _mode;

module.exports.setBuild = setBuild;
module.exports.setVersion = setVersion;
module.exports.getVersionName = getVersionName;
module.exports.getDateTime = getDateTime;
module.exports.getDisplayDateTime = getDisplayDateTime;
module.exports.minimize = minimize;
module.exports.getVerInfo = getVerInfo;

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
