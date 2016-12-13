/* jshint esnext:true */
(function (window, verinfo, settings, sources) {
   "use strict";
   var JSModules = {};
   window.UICustomizerDefine = UICustomizerDefine;
   window.UICustomizerRequire = UICustomizerRequire;
   window.UICustomizerEvent = UICustomizerEvent;
   var globalContainer = document.createElement('userscript');
   globalContainer.id = 'SBIS-UI-Customizer';
   document.getElementsByTagName('html')[0].appendChild(globalContainer);
   UICustomizerRequire(['Engine'], function (Engine) {
      Engine.init(verinfo, settings, sources, {
         GM_info: GM_info,
         GM_setClipboard: GM_setClipboard
      });
   });
   function UICustomizerDefine(name, dependences, constructor) {
      if (typeof dependences === 'function') {
         constructor = dependences;
         dependences = [];
      }
      UICustomizerRequire(dependences, function () {
         try {
            JSModules[name] = constructor.apply(null, dependences);
         } catch (err) {
            console.error(name, '-', err);
         }
      });
   }
   function UICustomizerRequire(dependences, func) {
      if (typeof dependences === 'function') {
         func = dependences;
         dependences = [];
      }
      for (let i = 0; i < dependences.length; i++) {
         let name = dependences[i];
         if (!(name in JSModules)) {
            let module = document.createElement('script');
            module.id = `SBIS-UI-Customizer-${name}-script`;
            module.className = 'SBIS-UI-Customizer';
            module.type = 'text/javascript';
            module.innerHTML = sources.js[name + '.js'];
            globalContainer.appendChild(module);
         }
         if (typeof (dependences[i] = JSModules[name]) !== 'object') {
            console.error('Модуль', name, 'недоступен');
            return false;
         }
      }
      func.apply(null, dependences);
   }
   function UICustomizerEvent(moduleName, eventName) {
      var args = [];
      for (let i = 2; i < arguments.length; i++) {
         args.push(arguments[i]);
      }
      UICustomizerRequire([moduleName], function (module) {
         try {
            module[eventName].apply(module, args);
         } catch (err) {
            console.error(moduleName + '.' + eventName, '-', err);
         }
      });
   }
})(unsafeWindow/*VERINFO*//*SETTINGS*//*SOURCES*/);