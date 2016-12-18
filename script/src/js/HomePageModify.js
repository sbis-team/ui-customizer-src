UICustomizerDefine('HomePageModify', ['Engine'], function (Engine) {
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
      let other = settings.options.Other.options;
      if (other.StretchPage.value || other.HideTapeEvents.value) {
         css += Engine.generateCSS.custom(
            '.np-View__twoColumns .sn-NewsPage__oneNews-contentLogo+.sn-NewsPage__oneNews-contentText',
            'max-width',
            'none !important'
         );
      }
      let news = settings.options.News.options;
      if (news.HideAuthor.value && news.HideFooterBtn.value) {
         css += Engine.getCSS('HomePageModify-FixHeight');
      }
      if (css) {
         Engine.appendCSS('HomePageModify', css);
      } else {
         Engine.removeCSS('HomePageModify');
      }
   }

});
