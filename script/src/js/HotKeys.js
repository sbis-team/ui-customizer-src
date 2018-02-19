UICustomizerDefine('HotKeys', ['SettingsDialog'], function (SettingsDialog) {
  'use strict';

  var keys = {
    'ctrl-shift-KeyU': () => SettingsDialog.toggle(),
    'ctrl-alt-KeyU': () => SettingsDialog.toggle()
  };

  return {
    init: init
  };

  function init() {
    document.addEventListener('keydown', (event) => {
      var hkey = '';
      if (event.ctrlKey) {
        hkey += 'ctrl-';
      }
      if (event.shiftKey) {
        hkey += 'shift-';
      }
      if (event.altKey) {
        hkey += 'alt-';
      }
      hkey += event.code;
      if (hkey in keys) {
        keys[hkey]();
        event.stopPropagation();
      }
    }, {
      capture: true
    });
  }

});
