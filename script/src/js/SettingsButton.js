UICustomizerDefine('SettingsButton', ['Engine'], function (Engine) {
  'use strict';

  return {
    init: init
  };

  function init() {
    Engine.appendCSS('SettingsButton');
    var container = Engine.createComponent('SettingsButton', {
      icon: Engine.getSVG('settings')
    });
    Engine.wait('div.engineUser-MenuPanel__footer', function (elm) {
      elm.forEach(element => element.prepend(container));
    });
  }

});
