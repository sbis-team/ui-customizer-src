UICustomizerDefine('HomePageModify', ['Engine'], function(Engine) {
   "use strict";

   return {
      applySettings: applySettings
   };

   function applySettings(settings) {
      var css = '';
      for (let groupName in settings.options) {
         let group = settings.options[groupName];
         for (let name in group.options) {
            if (group.options[name].value) {
               css += Engine.getCSS('HomePageModify-' + name);
            }
         }
      }
      if (css) {
         Engine.appendCSS('HomePageModify', css);
      } else {
         Engine.removeCSS('HomePageModify');
      }
   }

});