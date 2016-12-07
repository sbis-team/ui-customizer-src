"use strict";

const node_fs = require('fs');

const ndk_fn = require('ndk.fn');
const ndk_fs = require('ndk.fs');
const ndk_git = require('ndk.git');
const helper = require('./helper');

module.exports.push = push;

function push(version, build, scriptData, notes) {
   switch (helper.mode) {
      case 'development':
         return _push_development(scriptData);
      case 'candidate':
      case 'release':
         return _push_release(version, build, scriptData, notes);
   }
}

function _push_development(scriptData) {
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
      console.log(`Скрипт "${helper.mode}" v${scriptData.VERSION} успешно опубликован`);
      return true;
   });
}

function _push_release(version, build, scriptData, notes) {
   var srcgit = ndk_git.createCL('./', process.stdout, process.stderr);
   var trggit = ndk_git.createCL('./bin/ui-customizer/', process.stdout, process.stderr);
   var targetBranch = helper.mode;
   return ndk_fn.execute(function* () {
      if (!notes.added.length && !notes.changed.length && !notes.fixed.length && !notes.issues.length) {
         console.error('Необходимо заполнить заметки о выпуске!');
         return false;
      }
      if (helper.mode === 'release' && !notes.release) {
         console.error('Необходимо подтвердить обновление release!');
         return false;
      }
      if (!node_fs.existsSync('./bin/ui-customizer/')) {
         yield ndk_git.createCL('./bin/', process.stdout, process.stderr)
            .clone('git@github.com:sbis-team/ui-customizer.git');
      }
      if (helper.mode === 'release' && (yield srcgit['rev-parse']('--abbrev-ref', 'HEAD')) !== 'master') {
         console.error('Нельзя публиковать версию из побочной ветки!');
         return false;
      }
      console.log(`Обновляем "${helper.mode}" до v${scriptData.VERSION}`);
      yield trggit.fetch();
      yield trggit.reset();
      var branch = yield trggit['rev-parse']('--abbrev-ref', 'HEAD');
      if (branch !== targetBranch) {
         yield trggit.checkout(targetBranch);
      }
      yield trggit.pull();
      yield ndk_fs.copyFile(
         `bin/${helper.mode}_sbis-ui-customizer.user.js`,
         './bin/ui-customizer/sbis-ui-customizer.user.js',
         true
      );
      yield ndk_fs.copyFile(
         `bin/${helper.mode}_sbis-ui-customizer.meta.js`,
         './bin/ui-customizer/sbis-ui-customizer.meta.js',
         true
      );
      notes = yield createNotes(scriptData.DISPLAYDATE, scriptData.VERSION, notes);
      yield trggit.add('sbis-ui-customizer.user.js');
      yield trggit.add('sbis-ui-customizer.meta.js');
      yield trggit.commit('-m', notes);
      yield trggit.push();
      if (branch !== targetBranch) {
         yield trggit.checkout(branch);
      }
      if (helper.mode === 'release') {
         it.exec.cwd = thisRepo;
         yield it.exec('git fetch');
         yield it.exec('git reset');
         yield it.exec('git pull');
         if (yield it.exec('git status -s release-notes.json')) {
            yield it.exec('git add release-notes.json');
         }
         yield ndk_fs.writeJSON('source/version.json', version);
         yield it.exec('git add source/version.json');
         yield it.exec(`git commit -m "update ${helper.mode} v${scriptData.VERSION}"`);
         yield it.exec('git push');
         yield it.exec(`git checkout -b release/${scriptData.VERSION}`);
         yield it.exec(`git push origin release/${scriptData.VERSION}`);
         yield it.exec('git checkout master');
         build.number = 0;
      }
      console.log(`Скрипт "${helper.mode}" v${scriptData.VERSION} успешно опубликован`);
      return true;
   });
}

function createNotes(date, version, notes) {
   var trggit = ndk_git.createCL('./bin/ui-customizer/', process.stdout, process.stderr);
   return ndk_fn.execute(function* () {
      var text = `Обновление v${version}\n\n`;
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
      if (helper.mode === 'candidate') {
         yield ndk_fs.writeText('./bin/ui-customizer/README.md', '## ' + text);
         yield trggit.add('README.md');
      } else {
         let file = './bin/ui-customizer/CHANGELOG.md';
         let clog = yield ndk_fs.readText(file);
         clog = clog.replace(/История изменений/, 'История изменений\n\n' + '## ' + text + '---');
         yield ndk_fs.writeText(file, clog);
         yield ndk_fs.writeText('release-notes.json', JSON.stringify({
            release: false,
            added: [],
            changed: [],
            fixed: [],
            issues: []
         }, null, '   '));
         yield it.exec('git add CHANGELOG.md');
      }
      return text;
   });
}
