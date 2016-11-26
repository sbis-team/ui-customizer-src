"use strict";
const fn = require('ndk.fn');
const fs = require('ndk.fs');
const it = require('./it');
const helper = require('./helper');
fn.execute(function* () {
   var buildDate = new Date();
   var mode = helper.mode;
   var script = yield fs.readText('source/sbis-ui-customizer.template.user.js');
   var scriptData = yield fs.readJSON('source/sbis-ui-customizer.template.json');
   var localData = yield fs.readJSON('source/local-sbis-ui-customizer.template.json', {});
   var notes = yield fs.readJSON('release-notes.json');
   var build = helper.setBuild(yield fs.readJSON('bin/build.json', {}));
   var version = helper.setVersion(yield fs.readJSON('source/version.json', {}), notes);
   Object.assign(scriptData, localData);
   scriptData.VERSION = helper.getVersionName(version, build);
   scriptData.BUILD = build.number;
   scriptData.DATE = helper.getDateTime(buildDate);
   scriptData.DISPLAYDATE = helper.getDisplayDateTime(buildDate);
   scriptData.ICON = yield it.readImage('source/image/script-icon16.png');
   scriptData.ICON64 = yield it.readImage('source/image/script-icon64.png');
   scriptData.SCRIPT = helper.minimize(yield helper.parse(yield fs.readText('source/script.js'), {
      VERINFO: ', ' + helper.getVerInfo(scriptData, notes),
      SETTINGS: ', ' + (yield fs.readText('settings.json')),
      JS: ', ' + (yield it.readResources('source/js')),
      XHTML: ', ' + (yield it.readResources('source/xhtml')),
      CSS: ', ' + (yield it.readResources('source/css')),
      SVG: ', ' + (yield it.readResources('source/svg'))
   }));
   script = yield helper.parse(script, scriptData);
   yield it.mkdir('bin');
   yield fs.writeText(`bin/${mode}_sbis-ui-customizer.user.js`, script);
   var meta = script.replace(/^(\/\/ ==UserScript==[\s\S]*==\/UserScript==)[\s\S]*$/, '$1');
   yield fs.writeText(`bin/${mode}_sbis-ui-customizer.meta.js`, meta);
   console.log('Скрипт успешно собран v' + scriptData.VERSION);
   if (yield require('./publish').push(version, build, scriptData, notes)) {
      yield fs.writeJSON('bin/build.json', build, false);
   }
}).catch(err => {
   console.error(err);
});
