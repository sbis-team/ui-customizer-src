"use strict";

const node_fs = require('fs');

(() => {
   const node_child = require('child_process');
   const opt = { stdio: 'ignore' };
   ['env', 'fn', 'fs', 'git', 'src'].forEach(name => {
      if (
         !node_fs.existsSync(`node_modules/ndk.${name}`) &&
         !node_fs.existsSync(`node_modules/ndk.${name}.js`)
      ) {
         console.log(`Установка ndk.${name}...`);
         node_child.execSync(`npm install ndk.${name}`, opt);
      }
   });
})();

const ndk_env = require('ndk.env');
const ndk_fn = require('ndk.fn');
const ndk_fs = require('ndk.fs');
const ndk_git = require('ndk.git');

const parse_regexp = /^[A-Z0-9]+$/;
const parse_depthRegexp = /\/\*[A-Z0-9]+\*\//;
const parse_depthMax = 1000;

const it = module.exports;
it.build = it__build;

it.parse = parse;
it.setBuild = setBuild;
it.setVersion = setVersion;
it.getVersionName = getVersionName;
it.getDateTime = getDateTime;
it.minimize = minimize;
it.getVerInfo = getVerInfo;
it.publish = publish;

it.mode = 'development';
if (ndk_env.argv.candidate) {
   it.mode = 'candidate';
} else if (ndk_env.argv.release) {
   it.mode = 'release';
}

function it__build(opt) {

}


function parse(tmpl, data) {
   return ndk_fn.execute(function* () {
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
   switch (it.mode) {
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
   return ('0' + date.getDate()).slice(-2) + '.' +
      ('0' + (date.getMonth() + 1)).slice(-2) + '.' +
      date.getFullYear() + ' ' +
      ('0' + date.getHours()).slice(-2) + ':' +
      ('0' + date.getMinutes()).slice(-2) + ':' +
      ('0' + date.getSeconds()).slice(-2);
}

function minimize(script) {
   if (ndk_env.argv.minimize) {
      script = script.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\t+/g, ' ').replace(/ +/g, ' ');
   }
   return script;
}

function getVerInfo(scriptData, notes) {
   return JSON.stringify({
      version: scriptData.VERSION,
      date: scriptData.DATE,
      notes: {
         added: notes.added,
         changed: notes.changed,
         fixed: notes.fixed,
         issues: notes.issues
      }
   }, null, '   ');
}

function publish(version, build, scriptData, notes) {
   switch (it.mode) {
      case 'development':
         return __publish_development(scriptData);
      case 'candidate':
      case 'release':
         return __publish_release(version, build, scriptData, notes);
   }
}

function __publish_development(scriptData) {
   return ndk_fn.execute(function* () {
      console.log(`Обновляем "development" до v${scriptData.VERSION}`);
      yield ndk_fs.makeDir('server/bin');
      yield ndk_fs.copyFile(
         'bin/development_sbis-ui-customizer.user.js',
         'server/bin/sbis-ui-customizer.user.js',
         true
      );
      yield ndk_fs.copyFile(
         'bin/development_sbis-ui-customizer.meta.js',
         'server/bin/sbis-ui-customizer.meta.js',
         true
      );
      console.log(`Скрипт "${it.mode}" v${scriptData.VERSION} успешно опубликован`);
      return true;
   });
}

function __publish_release(version, build, scriptData, notes) {
   const srcgit = ndk_git.createCL('./', process.stdout, process.stderr);
   const trggit = ndk_git.createCL('./bin/ui-customizer/', process.stdout, process.stderr);
   const targetBranch = it.mode;
   return ndk_fn.execute(function* () {
      if (!notes.added.length && !notes.changed.length && !notes.fixed.length && !notes.issues.length) {
         console.error('Необходимо заполнить заметки о выпуске!');
         return false;
      }
      if (it.mode === 'release' && !notes.release) {
         console.error('Необходимо подтвердить обновление release!');
         return false;
      }
      if (!node_fs.existsSync('./bin/ui-customizer/')) {
         yield ndk_git.createCL('./bin/', process.stdout, process.stderr)
            .clone('git@github.com:sbis-team/ui-customizer.git');
      }
      console.log(`Обновляем "${it.mode}" до v${scriptData.VERSION}`);
      yield trggit.fetch();
      yield trggit.reset();
      const branch = yield trggit['rev-parse']('--abbrev-ref', 'HEAD');
      if (branch !== targetBranch) {
         yield trggit.checkout(targetBranch);
      }
      yield trggit.pull();
      yield ndk_fs.copyFile(
         `bin/${it.mode}_sbis-ui-customizer.user.js`,
         './bin/ui-customizer/sbis-ui-customizer.user.js',
         true
      );
      yield ndk_fs.copyFile(
         `bin/${it.mode}_sbis-ui-customizer.meta.js`,
         './bin/ui-customizer/sbis-ui-customizer.meta.js',
         true
      );
      notes = yield __publish_createNotes(scriptData.DATE, scriptData.VERSION, notes);
      yield trggit.add('sbis-ui-customizer.user.js');
      yield trggit.add('sbis-ui-customizer.meta.js');
      yield trggit.commit('-m', notes);
      yield trggit.push();
      if (branch !== targetBranch) {
         yield trggit.checkout(branch);
      }
      if (it.mode === 'release') {
         const oldBranch = yield srcgit['rev-parse']('--abbrev-ref', 'HEAD');
         const newBranch = `release/v${scriptData.VERSION}`;
         yield srcgit.fetch();
         yield srcgit.reset();
         yield srcgit.pull();
         if (yield srcgit.status('-s', 'release-notes.json')) {
            yield srcgit.add('release-notes.json');
         }
         yield ndk_fs.writeJSON('script/version.json', version);
         yield srcgit.add('script/version.json');
         yield srcgit.commit('-m', `Обновление v${scriptData.VERSION}-${it.mode}`);
         yield srcgit.push();
         yield srcgit.checkout('-b', newBranch);
         yield srcgit.push('origin', newBranch);
         if (oldBranch === 'development') {
            yield srcgit.checkout(oldBranch);
         }
         build.number = 0;
      }
      console.log(`Скрипт "${it.mode}" v${scriptData.VERSION} успешно опубликован`);
      return true;
   });
}

function __publish_createNotes(date, version, notes) {
   const trggit = ndk_git.createCL('./bin/ui-customizer/', process.stdout, process.stderr);
   return ndk_fn.execute(function* () {
      let text = `Обновление v${version}\n\n`;
      text += `Сборка от: ${date}\n\n`;
      if (notes.added.length) {
         text += '#### Новые возможности\n\n';
         notes.added.forEach((note) => {
            text += `* ${note}\n\n`;
         });
      }
      if (notes.changed.length) {
         text += '#### Небольшие изменения\n\n';
         notes.changed.forEach((note) => {
            text += `* ${note}\n\n`;
         });
      }
      if (notes.fixed.length) {
         text += '#### Исправленные ошибки\n\n';
         notes.fixed.forEach((note) => {
            text += `* ${note}\n\n`;
         });
      }
      if (notes.issues.length) {
         text += '#### Выполненные задачи\n\n';
         notes.issues.forEach((note) => {
            if (note instanceof Array) {
               let id = note[0].replace(/.*\/(\d+).*/g, '$1');
               text += `* [[issue#${id}](${note[0]})] ${note[1]}\n\n`;
            } else {
               text += `* ${note}\n\n`;
            }
         });
      }
      if (it.mode === 'candidate') {
         yield ndk_fs.writeText('./bin/ui-customizer/README.md', '## ' + text + '-\n\nCopyright (c) SBIS Team');
         yield trggit.add('README.md');
      } else {
         let file = './bin/ui-customizer/CHANGELOG.md';
         let clog = yield ndk_fs.readText(file);
         clog = clog.replace(/История изменений/, 'История изменений\n\n' + '### ' + text + '-');
         yield ndk_fs.writeText(file, clog);
         yield ndk_fs.writeText('release-notes.json', JSON.stringify({
            release: false,
            added: [],
            changed: [],
            fixed: [],
            issues: []
         }, null, '   '));
         yield trggit.add('CHANGELOG.md');
      }
      return text;
   });
}
