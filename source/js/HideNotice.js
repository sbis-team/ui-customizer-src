UICustomizerDefine('HideNotice', ['Engine'], function (Engine) {
   "use strict";

   return {
      applySettings: applySettings
   };

   function applySettings(settings) {
      if (settings.options.SBISPlugin.value) {
         Engine.waitSync('span.ws-window-title[title="Установите СБИС Плагин"]', _hideSBISPlugin);
      } else {
         Engine.unsubscribeWaitSync('span.ws-window-title[title="Установите СБИС Плагин"]', _hideSBISPlugin);
      }
   }

   function _hideSBISPlugin(elms) {
      for (let i = 0; i < elms.length; i++) {
         let elm = elms[i].parentElement.parentElement;
         elm.wsControl.close();
      }
   }

});