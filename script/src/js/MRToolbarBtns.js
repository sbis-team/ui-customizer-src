UICustomizerDefine('MRToolbarBtns', ['Engine', 'TaskToolbarBtns'], function (Engine, Task) {
  "use strict";

  var property = {
    btns: {
      TaskURL: {
        icon: 'link'
      }
    },
    ApplyDocTypeName: ['Merge request'],
    selectors: {
      'Print': 'div.SBIS-UI-Customizer.MRToolbarBtns .controls-Toolbar_item[title="Распечатать"]',
      'LinkOld': 'div.SBIS-UI-Customizer.MRToolbarBtns .controls-Toolbar_item[title="Скопировать в буфер"]',
      'Delete': 'div.SBIS-UI-Customizer.MRToolbarBtns .controls-Toolbar_item[title="Удалить"]'
    }
  };

  return {
    applySettings: applySettings
  };

  function applySettings(settings) {
    Task.applySettings(settings, 'MRToolbarBtns', property);
  }

});
