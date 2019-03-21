'use strict';
const it = require('./it');
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
    repoName: 'ui-customizer',
    branch: {
      development: 'development',
      candidate: 'candidate',
      release: 'release'
    },
    mode: {
      development: 'local',
      candidate: 'git',
      release: 'git'
    },
    notes: {
      candidate: 'README',
      release: 'CHANGELOG'
    }
  }
});

function* script_builder(options) {
  it.meta = yield it.parse(it.meta, {
    VERSION: it.versionName,
    DATE: it.buildDate,
    ICON: yield ndk_src.readDataImageBase64(options.icon),
    ICON64: yield ndk_src.readDataImageBase64(options.icon64)
  });
  it.script = yield it.parse(it.script, {
    VERINFO: ', ' + JSON.stringify({
      version: it.versionName,
      date: it.buildDate,
      notes: {
        added: it.notes.added,
        changed: it.notes.changed,
        fixed: it.notes.fixed,
        issues: it.notes.issues
      }
    }, null, '   '),
    SETTINGS: ', ' + (yield ndk_fs.readText(options.settings)),
    SOURCES: ', ' + (yield ndk_src.readAsEmbeddedObject(options.sources))
  });
}
