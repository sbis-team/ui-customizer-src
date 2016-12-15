UICustomizerDefine('AccordionHideItems', ['Engine'], function (Engine) {
   "use strict";

   const selectors = {
      'Documents': '#leftInfoBlocks div[data-id="documents"]',
      'Staff': '#leftInfoBlocks div[data-id="staff"]',
      'Tasks': '#leftInfoBlocks div[data-id="work"]',
      'Contacts': '#leftInfoBlocks div[data-id="contacts"]',
      'Calendar': '#leftInfoBlocks div[data-id="calendar"]',
      'MyPage': '#leftInfoBlocks div[data-id="myProfile"]',
      'Company': '#leftInfoBlocks div[data-id="contragents"]',
      'Business': '#leftInfoBlocks div[data-id="business"]',
      'Accounting': '#leftInfoBlocks div[data-id="accounting"]',
      'UTS': '#leftInfoBlocks div[data-id="ca_navication"]',
      'Telephony': '#leftInfoBlocks div[data-id="tel"]',
      'Retail': '#leftInfoBlocks div[data-id="retail"]',
      'Presto': '#leftInfoBlocks div[data-id="presto"]'
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
