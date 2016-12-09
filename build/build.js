"use strict";
const helper = require('./helper').checkInstallNDK();
const ndk_fn = require('ndk.fn');
const ndk_fs = require('ndk.fs');
const ndk_src = require('ndk.src');
const it = require('./it');
ndk_fn.execute(function* () {
   var buildDate = new Date();
   var script = yield ndk_fs.readText('source/sbis-ui-customizer.template.user.js');
   var scriptData = yield ndk_fs.readJSON('source/sbis-ui-customizer.template.json');
   var localData = yield ndk_fs.readJSON('source/local-sbis-ui-customizer.template.json', {});
   var notes = yield ndk_fs.readJSON('release-notes.json');
   var build = helper.setBuild(yield ndk_fs.readJSON('bin/build.json', {}));
   var version = helper.setVersion(yield ndk_fs.readJSON('source/version.json', {}), notes);
   Object.assign(scriptData, localData);
   scriptData.VERSION = helper.getVersionName(version, build);
   scriptData.DATE = helper.getDateTime(buildDate);
   scriptData.DISPLAYDATE = helper.getDisplayDateTime(buildDate);
   scriptData.ICON = yield ndk_src.readDataImageBase64('source/image/script-icon16.png');
   scriptData.ICON64 = yield ndk_src.readDataImageBase64('source/image/script-icon64.png');
   scriptData.SCRIPT = helper.minimize(yield helper.parse(yield ndk_fs.readText('source/script.js'), {
      VERINFO: ', ' + helper.getVerInfo(scriptData, notes),
      SETTINGS: ', ' + (yield ndk_fs.readText('settings.json')),
      JS: ', ' + (yield it.readSources('source/js')),
      XHTML: ', ' + (yield it.readSources('source/xhtml')),
      CSS: ', ' + (yield it.readSources('source/css')),
      SVG: ', ' + (yield it.readSources('source/svg'))
   }));
   script = yield helper.parse(script, scriptData);
   yield ndk_fs.makeDir('bin');
   yield ndk_fs.writeText(`bin/${helper.mode}_sbis-ui-customizer.user.js`, script);
   var meta = script.replace(/^(\/\/ ==UserScript==[\s\S]*==\/UserScript==)[\s\S]*$/, '$1');
   yield ndk_fs.writeText(`bin/${helper.mode}_sbis-ui-customizer.meta.js`, meta);
   console.log('Скрипт успешно собран v' + scriptData.VERSION);
   if (yield require('./publish').push(version, build, scriptData, notes)) {
      yield ndk_fs.writeJSON('bin/build.json', build);
   }
}).catch(err => {
   console.error(err);
});
