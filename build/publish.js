"use strict";

const path = require('path');

const fn = require('ndk.fn');
const fs = require('ndk.fs');
const it = require('./it');
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
   return fn.execute(function* () {
      console.log(`Обновляем "development" до v${scriptData.VERSION}`);
      yield fs.makeDir('server/bin');
      yield fs.writeText(
         path.join('server/bin/sbis-ui-customizer.user.js'),
         yield fs.readText('bin/development_sbis-ui-customizer.user.js')
      );
      yield fs.writeText(
         path.join('server/bin/sbis-ui-customizer.meta.js'),
         yield fs.readText('bin/development_sbis-ui-customizer.meta.js')
      );
      console.log(`Скрипт "${helper.mode}" v${scriptData.VERSION} успешно опубликован`);
      return true;
   });
}

function _push_release(version, build, scriptData, notes) {
   var thisRepo = path.resolve(__dirname, '../');
   var targetRepo = path.resolve(__dirname, '../bin/ui-customizer/');
   var targetBranch = helper.mode;
   return fn.execute(function* () {
      if (!notes.added.length && !notes.changed.length && !notes.fixed.length && !notes.issues.length) {
         console.error('Необходимо заполнить заметки о выпуске!');
         return false;
      }
      if (helper.mode === 'release' && !notes.release) {
         console.error('Необходимо подтвердить обновление release!');
         return false;
      }
      it.exec.cwd = thisRepo;
      if (helper.mode === 'release' && (yield it.exec('git symbolic-ref --short HEAD', true)) !== 'master') {
         console.error('Нельзя публиковать версию из побочной ветки!');
         return false;
      }
      console.log(`Обновляем "${helper.mode}" до v${scriptData.VERSION}`);
      it.exec.cwd = targetRepo;
      yield it.exec('git fetch');
      yield it.exec('git reset');
      var branch = yield it.exec('git symbolic-ref --short HEAD', true);
      if (branch !== targetBranch) {
         yield it.exec('git checkout ' + targetBranch);
      }
      yield it.exec('git pull');
      yield fs.writeText(
         path.join('./bin/ui-customizer', 'sbis-ui-customizer.user.js'),
         yield fs.readText(`bin/${helper.mode}_sbis-ui-customizer.user.js`)
      );
      yield fs.writeText(
         path.join('./bin/ui-customizer', 'sbis-ui-customizer.meta.js'),
         yield fs.readText(`bin/${helper.mode}_sbis-ui-customizer.meta.js`)
      );
      notes = yield createNotes(scriptData.DISPLAYDATE, scriptData.VERSION, notes);
      yield it.exec('git add sbis-ui-customizer.user.js');
      yield it.exec('git add sbis-ui-customizer.meta.js');
      yield it.exec(`git commit -m "${notes}"`);
      yield it.exec('git push');
      if (branch !== targetBranch) {
         yield it.exec('git checkout ' + branch);
      }
      if (helper.mode === 'release') {
         it.exec.cwd = thisRepo;
         yield it.exec('git fetch');
         yield it.exec('git reset');
         yield it.exec('git pull');
         if (yield it.exec('git status -s release-notes.json')) {
            yield it.exec('git add release-notes.json');
         }
         yield fs.writeJSON('source/version.json', version);
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
   return fn.execute(function* () {
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
         yield fs.writeText(path.join('./bin/ui-customizer', 'README.md'), '## ' + text);
         yield it.exec('git add README.md');
      } else {
         let file = path.join('./bin/ui-customizer', 'CHANGELOG.md');
         let clog = yield fs.readText(file);
         clog = clog.replace(/История изменений/, 'История изменений\n\n' + '## ' + text + '---');
         yield fs.writeText(file, clog);
         yield fs.writeText('release-notes.json', JSON.stringify({
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
