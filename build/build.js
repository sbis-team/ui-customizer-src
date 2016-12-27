"use strict";
const it = require('./it');
const ndk_fn = require('ndk.fn');
const ndk_fs = require('ndk.fs');
const ndk_src = require('ndk.src');

it.build({
   name: 'sbis-ui-customizer',
   meta: 'script/meta.js',
   script: 'script/script.js',
   notes: 'script/release-notes.json',
   version: 'script/version.json',
   buildFile: {
      development: 'bin/build.json',
      candidate: 'script/build.json'
   },
   buildPrefix: {
      development: 'dev',
      candidate: 'rc'
   },
   builder: script_builder,
   builderOptions: {
      icon: 'script/image/script-icon16.png',
      icon64: 'script/image/script-icon64.png',
      settings: 'script/settings.js',
      sources: 'script/src'
   },
   outputDir: 'bin',
   publish: {
      repo: 'git@github.com:sbis-team/ui-customizer.git',
      branch: {
         development: 'development',
         candidate: 'candidate',
         release: 'release'
      },
      mode: {
         development: 'local',
         candidate: 'git',
         release: 'git'
      }
   }
});

function* script_builder(options) {
   // TODO builder
   yield console.log('script_builder');
}

ndk_fn.execute(function* () {
   var notes = yield ndk_fs.readJSON('script/release-notes.json');
   var build = it.setBuild(yield ndk_fs.readJSON('bin/build.json', {}));
   var version = it.setVersion(yield ndk_fs.readJSON('script/version.json', {}), notes);
   var meta = yield ndk_fs.readText('script/meta.js');
   var script = yield ndk_fs.readText('script/script.js');
   var metaData = {};
   metaData.VERSION = it.getVersionName(version, build);
   metaData.DATE = it.getDateTime();
   metaData.ICON = yield ndk_src.readDataImageBase64('script/image/script-icon16.png');
   metaData.ICON64 = yield ndk_src.readDataImageBase64('script/image/script-icon64.png');
   meta = yield it.parse(meta, metaData);
   script = it.minimize(yield it.parse(script, {
      VERINFO: ', ' + it.getVerInfo(metaData, notes),
      SETTINGS: ', ' + (yield ndk_fs.readText('script/settings.js')),
      SOURCES: ', ' + (yield ndk_src.readAsEmbeddedObject('script/src'))
   }));
   yield ndk_fs.makeDir('bin');
   yield ndk_fs.writeText(`bin/${it.mode}_sbis-ui-customizer.meta.js`, meta);
   yield ndk_fs.writeText(`bin/${it.mode}_sbis-ui-customizer.user.js`, meta + script);
   console.log('Скрипт успешно собран v' + metaData.VERSION);
   if (yield it.publish(version, build, metaData, notes)) {
      yield ndk_fs.writeJSON('bin/build.json', build);
   }
}).catch(err => {
   console.error(err);
});
