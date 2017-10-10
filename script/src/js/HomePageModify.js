UICustomizerDefine('HomePageModify', ['Engine'], function (Engine) {
   "use strict";

   return {
      applySettings: applySettings
   };

   function applySettings(settings) {
      var css = '';
      let news = settings.options.News.options;
      /*
      if (news.HideAuthor.value && news.HideFooterBtn.value) {
         css += Engine.getCSS('HomePageModify-FixHeight');
      }
      */
      for (let groupName in settings.options) {
         let group = settings.options[groupName];
         for (let name in group.options) {
            let cssname = 'HomePageModify-' + name;
            if (group.options[name].value && Engine.hasCSS(cssname)) {
               css += Engine.getCSS(cssname);
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
      if (news.InOneColumn.value) {
         let elm = document.querySelector('.mp-NewsColumnView');
         if (elm) {
            InOneColumn();
         }
         Engine.wait('.sn-NewsLeftColumn', function () {
            InOneColumn();
         });
      }
      if (css) {
         Engine.appendCSS('HomePageModify', css);
      } else {
         Engine.removeCSS('HomePageModify');
      }
   }

   function InOneColumn() {
      if (document.querySelector('.mp-NewsColumnView .icon-Column2') && document.querySelector('.sn-NewsLeftColumn')) {
         if (document.querySelector('.mp-NewsColumnView .controls-IconButton').wsControl) {
            document.querySelector('.mp-NewsColumnView .controls-IconButton').click();
            Engine.waitOnce('.mp-NewsColumnView .controls-IconButton', function (elm) {
               elm.click();
            });
         } else {
            setTimeout(InOneColumn, 300);
         }
      }
   }

});
