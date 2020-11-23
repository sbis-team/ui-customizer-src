UICustomizerDefine('MRToolbarBtns', ['Engine', 'TaskToolbarBtns'], function (Engine, Task) {
  'use strict';

  var property = {
    btns: {
      TaskURL: {
        icon: 'link'
      }
    },
    ApplyDocTypeName: ['Merge request'],
    selectors: {
      'Print': '.SBIS-UI-Customizer-TaskToolbarBtns-MRToolbarBtns .controls-Toolbar__item[title="Распечатать"]',
      'LinkOld': '.SBIS-UI-Customizer-TaskToolbarBtns-MRToolbarBtns .controls-Toolbar__item[title="Скопировать в буфер"]',
      'Delete': '.SBIS-UI-Customizer-TaskToolbarBtns-MRToolbarBtns .controls-Toolbar__item[title="Удалить"]'
    }
  };

  return {
    applySettings: applySettings
  };

  function applySettings(settings) {
    Task.applySettings(settings, 'MRToolbarBtns', property);
  }

});
