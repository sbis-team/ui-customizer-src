"use strict";
const fn = require('ndk.fn');
const it = require('./it');
const helper = require('./helper');
fn.execute(function* () {
   var buildDate = new Date();
   var mode = helper.mode;
   var script = yield it.read('source/sbis-ui-customizer.template.user.js');
   var scriptData = yield it.readJSON('source/sbis-ui-customizer.template.json');
   var localData = yield it.readJSON('source/local-sbis-ui-customizer.template.json', {});
   var notes = yield it.readJSON('release-notes.json');
   var build = helper.setBuild(yield it.readJSON('bin/build.json', {}));
   var version = helper.setVersion(yield it.readJSON('source/version.json', {}), notes);
   Object.assign(scriptData, localData);
   scriptData.VERSION = helper.getVersionName(version, build);
   scriptData.BUILD = build.number;
   scriptData.DATE = helper.getDateTime(buildDate);
   scriptData.DISPLAYDATE = helper.getDisplayDateTime(buildDate);
   scriptData.ICON = yield it.readImage('source/image/script-icon16.png');
   scriptData.ICON64 = yield it.readImage('source/image/script-icon64.png');
   scriptData.SCRIPT = helper.minimize(yield it.parse(yield it.read('source/script.js'), {
      VERINFO: ', ' + helper.getVerInfo(scriptData, notes),
      SETTINGS: ', ' + (yield it.read('settings.json')),
      JS: ', ' + (yield it.readResources('source/js')),
      XHTML: ', ' + (yield it.readResources('source/xhtml')),
      CSS: ', ' + (yield it.readResources('source/css')),
      SVG: ', ' + (yield it.readResources('source/svg'))
   }));
   script = yield it.parse(script, scriptData);
   yield it.mkdir('bin');
   yield it.write(`bin/${mode}_sbis-ui-customizer.user.js`, script);
   var meta = script.replace(/^(\/\/ ==UserScript==[\s\S]*==\/UserScript==)[\s\S]*$/, '$1');
   yield it.write(`bin/${mode}_sbis-ui-customizer.meta.js`, meta);
   console.log('Скрипт успешно собран v' + scriptData.VERSION);
   if (yield require('./publish').push(version, build, scriptData, notes)) {
      yield it.writeJSON('bin/build.json', build);
   }
}).catch(err => {
   console.error(err);
});
