UICustomizerDefine('AccordionHideItems', ['Engine'], function (Engine) {
   "use strict";

   const selectors = {
      'Documents': '.nav-menu-container a[data-id="documents"]',
      'Staff': '.nav-menu-container a[data-id="staff"]',
      'Tasks': '.nav-menu-container a[data-id="work"]',
      'Contacts': '.nav-menu-container a[data-id="contacts"]',
      'Calendar': '.nav-menu-container a[data-id="calendar"]',
      'MyPage': '.nav-menu-container a[data-id="myProfile"]',
      'Company': '.nav-menu-container a[data-id="contragents"]',
      'Business': '.nav-menu-container a[data-id="business"]',
      'Accounting': '.nav-menu-container a[data-id="accounting"]',
      'UTS': '.nav-menu-container a[data-id="ca_navication"]',
      'Telephony': '.nav-menu-container a[data-id="tel"]',
      'Retail': '.nav-menu-container a[data-id="retail"]',
      'Presto': '.nav-menu-container a[data-id="presto"]'
   };

   return {
      applySettings: applySettings
   };

   function applySettings(settings) {
      var css = '';
      for (let groupName in settings.options) {
         let group = settings.options[groupName];
         for (let name in group.options) {
            if (group.options[name].value) {
               css += Engine.generateCSS.displayNone(selectors[name]);
            }
         }
      }
      if (css) {
         Engine.appendCSS('AccordionHideItems', css);
      } else {
         Engine.removeCSS('AccordionHideItems');
      }
   }

});
