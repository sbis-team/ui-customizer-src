UICustomizerDefine('OtherBlocksHide', ['Engine'], function (Engine) {
   "use strict";

   return {
      applySettings: applySettings
   };

   function applySettings(settings) {
      var css = '';
      for (let groupName in settings.options) {
         let group = settings.options[groupName];
         if (group.module) {
            continue;
         }
         for (let name in group.options) {
            if (group.options[name].value) {
               css += Engine.getCSS('OtherBlocksHide-' + name);
            }
         }
      }
      if (css) {
         Engine.appendCSS('OtherBlocksHide', css);
      } else {
         Engine.removeCSS('OtherBlocksHide');
      }
   }

});