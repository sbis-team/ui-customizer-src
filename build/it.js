"use strict";

const node_fs = require('fs');
const node_http = require('http');
const node_url = require('url');
const node_os = require('os');
const node_dns = require('dns');
const node_util = require('util');

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

function it__build(options) {
   it.options = options;
   ndk_fn.execute(__builder).catch(err => {
      console.error(err);
   });
}

function* __builder() {
   __log_step('Сборка');
   it.meta = yield ndk_fs.readText(it.options.meta);
   it.script = yield ndk_fs.readText(it.options.script);
   it.notes = yield ndk_fs.readJSON(it.options.notes);
   it.version = yield ndk_fs.readJSON(it.options.version);
   if (it.notes.added.length) {
      it.version.minor += 1;
      it.version.patch = 0;
   } else {
      it.version.patch += 1;
   }
   it.version = `${it.version.major}.${it.version.minor}.${it.version.patch}`;
   it.buildFile = it.options.buildFile[it.mode];
   if (it.buildFile) {
      it.buildNumber = (yield ndk_fs.readJSON(it.buildFile, {})).number;
      if (isNaN(it.buildNumber)) {
         it.buildNumber = 0;
      }
      it.buildNumber += 1;
   }
   it.buildPrefix = it.options.buildPrefix[it.mode];
   if (it.buildNumber && it.buildPrefix) {
      it.version += `.${it.buildPrefix}${it.buildNumber}`;
   }
   __log_variable(it.version);
   it.buildDate = getDateTime();
   __log_variable(it.buildDate);
   yield ndk_fn.execute(it.options.builder(it.options.builderOptions));
   if (it.meta.slice(-1) !== '\n') {
      it.meta += '\n';
   }
   if (ndk_env.argv.minimize) {
      __minimize();
   }
   it.script = it.meta + it.script;
   __buildNotes();
   __log_step('Запись на диск');
   yield ndk_fs.makeDir(it.options.outputDir);
   it.outputPath = `${it.options.outputDir}/${it.mode}_`;
   it.metaFile = `${it.options.name}.meta.js`;
   it.outputMeta = it.outputPath + it.metaFile;
   __log_variable(it.outputMeta);
   yield ndk_fs.writeText(it.outputMeta, it.meta);
   it.scriptFile = `${it.options.name}.user.js`;
   it.outputScript = it.outputPath + it.scriptFile;
   __log_variable(it.outputScript);
   yield ndk_fs.writeText(it.outputScript, it.script);
   __log_step('Публикация');
   it.publishMode = it.options.publish.mode[it.mode];
   switch (it.publishMode) {
      case 'local':
         it.successfully = yield __publish_local();
         break;
   }
   if (!it.successfully) {
      console.error('Сборка и обновление завершились с ошибкой');
      return false;
   }
   if (it.buildNumber) {
      __log_step('Запись на диск');
      __log_variable(it.buildFile);
      yield ndk_fs.writeJSON(it.buildFile, {
         number: it.buildNumber
      });
   }
   __log_step('Сборка и обновление успешно завершены');
}

function __minimize() {
   let s1 = it.script.length;
   it.script = it.script
      .replace(/\r/g, ' ')
      .replace(/\t+/g, ' ')
      .replace(/  +/g, ' ')
      .replace(/\n\n+/g, '\n')
      .replace(/ *\n */g, '\n');
   let s2 = it.script.length;
   __log_variable('min: ' + (((s2 / s1) * 10000) ^ 0) / 100 + '%');
}

function __buildNotes() {
   __log_step('Заметки о выпуске');
   it.notesMD = '';
   it.notesTXT = '';
   __buildNotes_forEach('Новые возможности', it.notes.added);
   __buildNotes_forEach('Небольшие изменения', it.notes.changed);
   __buildNotes_forEach('Исправленные ошибки', it.notes.fixed);
   __buildNotes_forEach('Выполненные задачи', it.notes.issues);
   if (it.notesMD) {
      it.notesMD = `Обновление v${it.version}\n\n` +
         `Сборка от: ${it.buildDate}\n\n` +
         it.notesMD;
      it.notesTXT = `Обновление v${it.version}\n` +
         it.notesTXT;
}
}

function __buildNotes_forEach(name, notes) {
   if (notes.length) {
      it.notesMD += `#### ${name}\n\n`;
      it.notesTXT += `${name}\n`;
      __log_variable(name, '-', notes.length);
      notes.forEach((note) => {
         if (note instanceof Array) {
            let id = note[0].replace(/.*\/(\d+).*/g, '$1');
            it.notesMD += `* [[issue#${id}](${note[0]})] ${note[1]}\n\n`;
            it.notesTXT += ` - ${note[0]} - ${note[1]}\n`;
            __log_text('-', ...note);
         } else {
            it.notesMD += `* ${note}\n\n`;
            it.notesTXT += ` - ${note}\n`;
            __log_text('-', note);
         }
      });
   }
}

function __publish_local() {
   return new Promise((resolve, reject) => {
      const hostname = node_os.hostname();
      const port = 1777;
      const server = node_http.createServer(function requestListener(req, res) {
         req.url = node_url.parse(req.url, true);
         res.end = (function (end) {
            return function (data, callback) {
               node_dns.reverse(req.socket.remoteAddress, (err, hostnames) => {
                  let addr = hostnames[0] || req.socket.remoteAddress;
                  __log_text(`${addr} ${res.statusCode} ${req.method} ${req.url.href}`);
                  end.call(res, data);
                  if (typeof callback === 'function') {
                     callback();
                  }
               });
            };
         })(res.end);
         switch (req.url.pathname) {
            case `/${it.scriptFile}`:
               res.setHeader('Content-Type', 'text/js;charset=utf-8');
               res.end(it.script, () => {
                  __log_text(`Скрипт "${it.mode}" v${it.version} успешно опубликован`);
                  resolve(true);
                  setTimeout(process.exit, 100);
               });
               break;
            case `/${it.metaFile}`:
               res.setHeader('Content-Type', 'text/js;charset=utf-8');
               res.end(it.meta);
               break;
            default:
               res.setHeader('Content-Type', 'text/plain;charset=utf-8');
               res.statusCode = 404;
               res.end(node_http.STATUS_CODES['404']);
         }
      });
      server.on('error', function (err) {
         reject(err);
      });
      server.listen(port, hostname, function () {
         __log_text(`Обновляем "${it.mode}" до v${it.version} с:`);
         __log_variable(`http://${hostname}:${port}/${it.scriptFile}`);
      });
   });
}

function __log_step(title) {
   title = __apply__color(__apply__color(title, 'blue'), 'bold');
   process.stdout.write(`***   ${title}   ***\n`);
}

function __log_variable(...value) {
   value[0] = __apply__color(value[0], 'green');
   process.stdout.write(`* ${value.join(' ')} \n`);
}

function __log_text(...value) {
   for (let i = 0; i < value.length; i++) {
      value[i] = value[i].replace(/\n/g, '\n* ');
   }
   process.stdout.write(`* ${value.join(' ')} \n`);
}

function __apply__color(str, color) {
   let colors = node_util.inspect.colors;
   if (color in colors) {
      let open = colors[color][0];
      let close = colors[color][1];
      return `\u001b[${open}m${str}\u001b[${close}m`;
   } else {
      return str;
   }
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
      let s1 = script.length;
      script = script
         .replace(/\r/g, ' ')
         .replace(/\t+/g, ' ')
         .replace(/  +/g, ' ')
         .replace(/\n\n+/g, '\n')
         .replace(/ *\n */g, '\n');
      let s2 = script.length;
      console.log('Минимизация:', (((s2 / s1) * 10000) ^ 0) / 100 + '%');
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
   return new Promise((resolve, reject) => {
      const hostname = node_os.hostname();
      const port = 1777;
      const server = node_http.createServer(function requestListener(req, res) {
         ndk_fn.execute(function* () {
            req.url = node_url.parse(req.url, true);
            res.end = (function (end) {
               return function (data, callback) {
                  node_dns.reverse(req.socket.remoteAddress, (err, hostnames) => {
                     let addr = hostnames[0] || req.socket.remoteAddress;
                     console.log(`${addr} ${res.statusCode} ${req.method} ${req.url.href}`);
                     end.call(res, data);
                     if (typeof callback === 'function') {
                        callback();
                     }
                  });
               };
            })(res.end);
            switch (req.url.pathname) {
               case '/sbis-ui-customizer.user.js':
                  res.setHeader('Content-Type', 'text/js;charset=utf-8');
                  res.end(yield ndk_fs.readText(`bin/development_sbis-ui-customizer.user.js`), () => {
                     console.log(`Скрипт "${it.mode}" v${scriptData.VERSION} успешно опубликован`);
                     resolve(true);
                     setTimeout(process.exit, 100);
                  });
                  break;
               case '/sbis-ui-customizer.meta.js':
                  res.setHeader('Content-Type', 'text/js;charset=utf-8');
                  res.end(yield ndk_fs.readText(`bin/development_sbis-ui-customizer.meta.js`));
                  break;
               default:
                  res.setHeader('Content-Type', 'text/plain;charset=utf-8');
                  res.statusCode = 404;
                  res.end('404 Not Found');
            }
         }).catch(err => {
            reject(err);
            res.setHeader('Content-Type', 'text/plain;charset=utf-8');
            res.statusCode = 500;
            res.end('500 Internal Server Error');
         });
      });
      server.on('error', function (err) {
         reject(err);
      });
      server.listen(port, hostname, function () {
         console.log(`Обновить с: http://${hostname}:${port}/sbis-ui-customizer.user.js`);
      });
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
         if (yield srcgit.status('-s', 'script/release-notes.json')) {
            yield srcgit.add('script/release-notes.json');
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
         yield ndk_fs.writeText('script/release-notes.json', JSON.stringify({
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
