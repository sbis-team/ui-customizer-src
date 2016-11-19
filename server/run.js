'use strict';

const path = require('path');
const fs = require('fs');
const http_createServer = require('http').createServer;
const url_parse = require('url').parse;
const server = http_createServer(requestListener);
const contentTypes = {
   '.html': 'text/html;charset=utf-8',
   '.css': 'text/css;charset=utf-8',
   '.js': 'text/js;charset=utf-8',
   '.json': 'application/json;charset=utf-8',
   '.png': 'image/png'
};

process.chdir(__dirname);

try {
   var config = require('./local-config');
} catch (e) {
   config = require('./config');
}

server.on('error', function (err) {
   logit(new Error(err.message));
});

fs.mkdir(path.resolve('./log'), () => {
   server.listen(config.port || 0, config.host || 'localhost', function () {
      var address = server.address();
      logit(`Сервер запущен: http://${address.address}:${address.port}`);
   });
});

function requestListener(req, res) {
   req.url = url_parse(req.url, true);
   res.end = (function (end) {
      return function (data) {
         logit(`${req.socket.remoteAddress} ${res.statusCode} ${req.method} ${req.url.href}`);
         end.call(res, data);
      };
   })(res.end);
   switch (req.url.pathname) {
      case '/sbis-ui-customizer.user.js':
         return sendUserScript(req, res);
      case '/sbis-ui-customizer.meta.js':
         return sendUserScriptMeta(req, res);
      case '/favicon.ico':
         return sendFavicon(req, res);
      default:
         return sendResource(req, res);
   }
}

function sendUserScript(req, res) {
   fs.readFile(path.resolve('./bin/sbis-ui-customizer.user.js'), 'utf8', (err, data) => {
      if (err) {
         sendError(req, res);
         logit(new Error(err.message));
      } else {
         res.setHeader('Content-Type', contentTypes['.js']);
         res.end(data);
      }
   });
}

function sendUserScriptMeta(req, res) {
   fs.readFile(path.resolve('./bin/sbis-ui-customizer.meta.js'), 'utf8', (err, data) => {
      if (err) {
         sendError(req, res);
         logit(new Error(err.message));
      } else {
         res.setHeader('Content-Type', contentTypes['.js']);
         res.end(data);
      }
   });
}

function sendFavicon(req, res) {
   fs.readFile(path.resolve('./resources/favicon.png'), (err, data) => {
      if (err) {
         sendError(req, res);
         logit(new Error(err.message));
      } else {
         res.setHeader('Content-Type', contentTypes['.png']);
         res.end(data);
      }
   });
}

function sendResource(req, res) {
   var file = path.resolve(path.join('./resources', req.url.pathname));
   fs.readFile(file, (err, data) => {
      if (err) {
         fs.readFile(path.resolve('./resources/404.html'), (err, data) => {
            if (err) {
               res.setHeader('Content-Type', 'text/plain;charset=utf-8');
               res.statusCode = 404;
               res.end('404 Not Found');
            } else {
               res.setHeader('Content-Type', contentTypes['.html']);
               res.statusCode = 404;
               res.end(data);
            }
         });
      } else {
         res.setHeader('Content-Type', contentTypes[path.extname(file)]);
         res.end(data);
      }
   });
}

function sendError(req, res) {
   res.setHeader('Content-Type', 'text/plain;charset=utf-8');
   res.statusCode = 500;
   res.end('500 Internal Server Error');
}

function logit(msg) {
   var file = `./log/${getDate()}.log`;
   if (msg instanceof Error) {
      msg = msg.stack;
   }
   msg = `${getDateTime()} - ${msg}`;
   console.log(msg);
   fs.appendFile(path.resolve(file), msg + '\n', 'utf8', (err) => {
      if (err) {
         console.log(err);
      }
   });
}

function getDate() {
   var date = new Date();
   return date.getFullYear() + '_' +
      ('0' + (date.getMonth() + 1)).slice(-2) + '_' +
      ('0' + date.getDate()).slice(-2);
}

function getDateTime() {
   var date = new Date();
   return date.getFullYear() + '-' +
      ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
      ('0' + date.getDate()).slice(-2) + 'T' +
      ('0' + date.getHours()).slice(-2) + ':' +
      ('0' + date.getMinutes()).slice(-2) + ':' +
      ('0' + date.getSeconds()).slice(-2) + '.' +
      ('00' + date.getMilliseconds()).slice(-3);
}

function generateUUID() {
   var d = new Date().getTime();
   var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
      .replace(/[xy]/g, function (c) {
         var r = (d + Math.random() * 16) % 16 | 0;
         d = Math.floor(d / 16);
         return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
   return uuid;
}