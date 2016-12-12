"use strict";
const it = require('./it');
const ndk_fn = require('ndk.fn');
const ndk_fs = require('ndk.fs');
const ndk_src = require('ndk.src');
ndk_fn.execute(function* () {
   var buildDate = new Date();
   var notes = yield ndk_fs.readJSON('release-notes.json');
   var build = it.setBuild(yield ndk_fs.readJSON('bin/build.json', {}));
   var version = it.setVersion(yield ndk_fs.readJSON('source/version.json', {}), notes);
   var script = yield ndk_fs.readText('source/sbis-ui-customizer.template.user.js');
   var scriptData = {};
   scriptData.VERSION = it.getVersionName(version, build);
   scriptData.DATE = it.getDateTime(buildDate);
   scriptData.DISPLAYDATE = it.getDisplayDateTime(buildDate);
   scriptData.ICON = yield ndk_src.readDataImageBase64('source/image/script-icon16.png');
   scriptData.ICON64 = yield ndk_src.readDataImageBase64('source/image/script-icon64.png');
   scriptData.SCRIPT = it.minimize(yield it.parse(yield ndk_fs.readText('source/script.js'), {
      VERINFO: ', ' + it.getVerInfo(scriptData, notes),
      SETTINGS: ', ' + (yield ndk_fs.readText('settings.json')),
      JS: ', ' + (yield ndk_src.readAsEmbeddedObject('source/js')),
      XHTML: ', ' + (yield ndk_src.readAsEmbeddedObject('source/xhtml')),
      CSS: ', ' + (yield ndk_src.readAsEmbeddedObject('source/css')),
      SVG: ', ' + (yield ndk_src.readAsEmbeddedObject('source/svg'))
   }));
   script = yield it.parse(script, scriptData);
   yield ndk_fs.makeDir('bin');
   yield ndk_fs.writeText(`bin/${it.mode}_sbis-ui-customizer.user.js`, script);
   var meta = script.replace(/^(\/\/ ==UserScript==[\s\S]*==\/UserScript==)[\s\S]*$/, '$1');
   yield ndk_fs.writeText(`bin/${it.mode}_sbis-ui-customizer.meta.js`, meta);
   console.log('Скрипт успешно собран v' + scriptData.VERSION);
   if (yield it.publish(version, build, scriptData, notes)) {
      yield ndk_fs.writeJSON('bin/build.json', build);
   }
}).catch(err => {
   console.error(err);
});
