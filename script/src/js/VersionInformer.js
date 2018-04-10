UICustomizerDefine('VersionInformer', ['Engine', 'SettingsDialog'], function (Engine, SettingsDialog) {
  'use strict';

  var _dialog = '';

  return {
    open: open,
    close: close,
    settings: settings
  };

  function open() {
    var verinfo = Engine.getVerInfo();
    var notes = verinfo.notes;
    var content = '';
    if (notes.added.length) {
      content += '<div class="group"><span class="title">Новые возможности</span><ul>';
      for (let i = 0; i < notes.added.length; i++) {
        content += '<li>' + notes.added[i] + '</li>';
      }
      content += '</ul></div>';
    }
    if (notes.changed.length) {
      content += '<div class="group"><span class="title">Небольшие изменения</span><ul>';
      for (let i = 0; i < notes.changed.length; i++) {
        content += '<li>' + notes.changed[i] + '</li>';
      }
      content += '</ul></div>';
    }
    if (notes.fixed.length) {
      content += '<div class="group"><span class="title">Исправленные ошибки</span><ul>';
      for (let i = 0; i < notes.fixed.length; i++) {
        content += '<li>' + notes.fixed[i] + '</li>';
      }
      content += '</ul></div>';
    }
    if (notes.issues.length) {
      content += '<div class="group"><span class="title">Выполненные задачи</span><ul>';
      for (let i = 0; i < notes.issues.length; i++) {
        let note = notes.issues[i];
        if (note instanceof Array) {
          let id = note[0].replace(/.*\/(\d+).*/g, '$1');
          content += '<li>[<a target="_blank" href="' + note[0] +
            '">issue#' + id + '</a>] ' + note[1] + '</li>';
        } else {
          content += '<li>' + note + '</li>';
        }
      }
      content += '</ul></div>';
    }
    if (!content) {
      localStorage.setItem('SBIS-UI-Customizer-LastVersion', verinfo.version);
      return true;
    }
    Engine.appendCSS('VersionInformer');
    _dialog = Engine.createElement('VersionInformer', {
      title: verinfo.version,
      date: verinfo.date,
      content: content
    });
    Engine.waitOnce('body', function (body) {
      body.appendChild(_dialog);
      _resize();
      window.addEventListener('resize', _resize);
      window.addEventListener('keydown', _esc);
    });
  }

  function close() {
    var verinfo = Engine.getVerInfo();
    _dialog.remove();
    _dialog = null;
    Engine.removeCSS('VersionInformer');
    window.removeEventListener('resize', _resize);
    window.removeEventListener('keydown', _esc);
    localStorage.setItem('SBIS-UI-Customizer-LastVersion', verinfo.version);
  }

  function settings() {
    close();
    SettingsDialog.open();
  }

  function _resize() {
    var area = _dialog.children[0].children[1];
    var dlg = area.children[0];
    dlg.style.marginTop = Math.round((area.clientHeight / 2 - dlg.clientHeight / 2)) + 'px';
    dlg.style.marginLeft = Math.round((area.clientWidth / 2 - dlg.clientWidth / 2)) + 'px';
  }

  function _esc(event) {
    if (event.key === 'Escape') {
      close();
    }
  }

});
