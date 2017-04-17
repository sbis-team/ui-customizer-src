UICustomizerDefine('HomePageModify', ['Engine'], function (Engine) {
   "use strict";

   return {
      applySettings: applySettings
   };

   function applySettings(settings) {
      var css = '';
      /*
      let news = settings.options.News.options;
      if (news.HideAuthor.value && news.HideFooterBtn.value) {
         css += Engine.getCSS('HomePageModify-FixHeight');
      }
      */
      for (let groupName in settings.options) {
         let group = settings.options[groupName];
         for (let name in group.options) {
            if (group.options[name].value) {
               css += Engine.getCSS('HomePageModify-' + name);
            }
         }
      }
      /*
      if (news.HideAuthor.value && news.SlimBorder.value) {
         css += Engine.generateCSS.custom(
            '.sn-NewsPage .sn-DraftIcon, .sn-NewsPage .sn-FavoriteIcon, .sn-NewsPage .sn-PinIcon',
            'top',
            '0px !important'
         );
      }
      */
      if (css) {
         Engine.appendCSS('HomePageModify', css);
      } else {
         Engine.removeCSS('HomePageModify');
      }
   }

});
