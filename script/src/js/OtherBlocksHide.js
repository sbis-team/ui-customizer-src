UICustomizerDefine('OtherBlocksHide', ['Engine'], function (Engine) {
  'use strict';

  const selectors = {
    'Owl': 'div[data-component="SBIS3.Engine.HowEasy"]',
    'AsJust': `
         .ExpandOurOrg__div,
         .middle__OurOrgHowEasy
      `,
    'SideRight': 'div.news-SpecialNews',
    'HideMaximumButton': '.NavSchemeLink.navSidebar__navSchemeLink'
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
