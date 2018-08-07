UICustomizerDefine('OtherBlocksHide', ['Engine'], function (Engine) {
  'use strict';

  const selectors = {
    'Owl': 'div[sbisname="howEasy"], .online-howEasy',
    'HideMaximumButton': '.NavSchemeLink.navSidebar__navSchemeLink, .NavSchemeLink.engine-Sidebar__navSchemeLink'
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
