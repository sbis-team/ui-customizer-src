UICustomizerDefine('OtherBlocksHide', ['Engine'], function (Engine) {
   "use strict";

   const selectors = {
      'Owl': 'div[data-component="SBIS3.Engine.HowEasy"]',
      'AsJust': `
         .componentCommandsPannelArea div.mainPage_verticalLine,
         .componentCommandsPannelArea i[sbisname="ExpandOurOrg"],
         table.events_tape_wrapper .middle__OurOrgHowEasy
      `,
      'SideRight': '#sideRight, div.news-SpecialNews[sbisname="SpecialNewsRight"]'
   };

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
               css += Engine.generateCSS.displayNone(selectors[name]);
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