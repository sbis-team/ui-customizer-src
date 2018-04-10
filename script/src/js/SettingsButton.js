UICustomizerDefine('SettingsButton', ['Engine'], function (Engine) {
  'use strict';

  return {
    init: init
  };

  function init() {
    Engine.appendCSS('SettingsButton');
    Engine.waitOnce('div.am-User__panel-lists .controls-ListView__itemsContainer', function (elm) {
      var container = Engine.createComponent('SettingsButton', {
        icon: Engine.getSVG('settings')
      });
      elm.parentElement.insertBefore(container, elm);
    });
  }

});
