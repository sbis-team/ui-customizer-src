UICustomizerDefine('SettingsButton', ['Engine'], function (Engine) {
   "use strict";

   return {
      init: init
   };

   function init() {
      Engine.appendCSS('SettingsButton');
      Engine.waitOnce('div.user-panel div[sbisname="Кнопки"]', function (elm) {
         var container = Engine.createComponent('SettingsButton');
         elm.parentElement.insertBefore(container, elm);
      });
   }

});