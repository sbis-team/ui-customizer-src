UICustomizerDefine('SettingsButton', ['Engine'], function (Engine) {
   "use strict";

   return {
      init: init
   };

   function init() {
      Engine.appendCSS('SettingsButton');
      Engine.waitOnce('div.account_management__user-panel .account_management__user-panel-buttons-list .controls-ListView__itemsContainer', function (elm) {
         var container = Engine.createComponent('SettingsButton');
         elm.parentElement.insertBefore(container, elm);
      });
   }

});
