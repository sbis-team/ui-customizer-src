UICustomizerDefine('OtherBlocksHide', ['Engine'], function (Engine) {
  'use strict';

  const selectors = {
    'Owl': {
      cls: 'div.online-Sidebar__helpButton'
    },
    'HideMaximumButton': {
      cls: '.online-Sidebar__navSchemeLink',
      visibilityHidden: true
    }
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
          var cfg = selectors[name];
          if (cfg.visibilityHidden) {
            css += Engine.generateCSS.visibilityHidden(cfg.cls);
          } else {
            css += Engine.generateCSS.displayNone(cfg.cls);
          }
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
