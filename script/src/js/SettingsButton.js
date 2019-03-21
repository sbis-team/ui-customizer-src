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
    Engine.wait('div.engineUser-MenuPanel__scrollContainer', function (elm) {
      elm.forEach(element => element.append(container));
    });
    Engine.wait('div.engine-ViewSettingsWindow__width', function (elm) {
      elm.forEach(element => element.append(container));
    });


  }

});
