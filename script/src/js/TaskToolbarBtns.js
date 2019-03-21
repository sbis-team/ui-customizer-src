UICustomizerDefine('TaskToolbarBtns', ['Engine'], function (Engine) {
  'use strict';

  const PARSE_ERROR = 'TaskToolbarBtns: Ошибка разбора карточки задачи';
  const WAITING_COMPONENT = 'TaskToolbarBtns: Ожидание загрузки карточки задачи';
  const ReplaceDocTypeName = {
    'Ошибка в разработку': 'Ошибка',
    'Задача в разработку': 'Задача'
  };
  const toolbarClass = '.edo3-Dialog__head-first-line-buttons .controls-Toolbar';
  var property = {
    btns: {
      TaskURL: {
        icon: 'link'
      },
      BranchName: {
        icon: 'git-branch'
      },
      СommitMsg: {
        icon: 'git-commit'
      }
    },
    ApplyDocTypeName: ['Ошибка в разработку', 'Задача в разработку'],
    selectors: {
      'Print': 'div.SBIS-UI-Customizer.TaskToolbarBtns .controls-Toolbar_item[title="Распечатать"]',
      'LinkOld': 'div.SBIS-UI-Customizer.TaskToolbarBtns .controls-Toolbar_item[title="Скопировать в буфер"]',
      'Delete': 'div.SBIS-UI-Customizer.TaskToolbarBtns .controls-Toolbar_item[title="Удалить"]'
    }
  };
  var BranchNameUserLogin = '';
  var idReadedUserLogin = false;
  var allWaitHandlers = {};

  return {
    applySettings: applySettings,
    copyToClipboard: copyToClipboard,
    _resolve_edo_dialog_record: _resolve_edo_dialog_record,
    _get_doc_number: _get_doc_number,
    _get_doc_author: _get_doc_author,
    _get_doc_name: _get_doc_name,
    _get_doc_date: _get_doc_date,
    _get_doc_url: _get_doc_url,
    _get_doc_description: _get_doc_description
  };

  function applySettings(settings, moduleName, moduleProperty) {
    var group, css = '';
    moduleName = moduleName ? moduleName : 'TaskToolbarBtns';
    moduleProperty = moduleProperty ? moduleProperty : property;
    group = settings.options.Hide;
    for (let name in group.options) {
      if (group.options[name].value) {
        css += Engine.generateCSS.displayNone(moduleProperty.selectors[name]);
      }
    }
    group = settings.options.Add;
    let addExtraButtons = false;
    moduleProperty.ExtraButtonsHTML = '';
    for (let name in group.options) {
      if (group.options[name].value) {
        addExtraButtons = true;
        let btn = Engine.getHTML(moduleName + '-' + name);
        btn = btn.replace(/\{\{icon\}\}/, Engine.getSVG(moduleProperty.btns[name].icon));
        moduleProperty.ExtraButtonsHTML += btn;
      } else {
        Engine.removeByQuery('.SBIS-UI-Customizer.' + moduleName + '-ExtraButtons .' + name);
      }
    }
    if (addExtraButtons) {
      let extbtn = Engine.getCSS('TaskToolbarBtns-ExtraButtons');
      if (moduleName !== 'TaskToolbarBtns') {
        extbtn = extbtn.replace(/TaskToolbarBtns/g, moduleName);
      }
      css += extbtn;
      if (moduleProperty.WaitHandler) {
        Engine.unsubscribeWait(toolbarClass, moduleProperty.WaitHandler);
      }
      moduleProperty.WaitHandler = _appendExtraButtons(moduleName, moduleProperty);
      allWaitHandlers[moduleName] = moduleProperty.WaitHandler;
      Engine.wait(toolbarClass, moduleProperty.WaitHandler);
    } else {
      if (moduleProperty.WaitHandler) {
        Engine.unsubscribeWait(toolbarClass, moduleProperty.WaitHandler);
        delete moduleProperty.WaitHandler;
        delete allWaitHandlers[moduleName];
      }
      if (css) {
        moduleProperty.WaitHandler = _appendButtonsClass(moduleName, moduleProperty);
        allWaitHandlers[moduleName] = moduleProperty.WaitHandler;
        Engine.wait(toolbarClass, moduleProperty.WaitHandler);
      }
      Engine.removeByQuery('.SBIS-UI-Customizer.' + moduleName + '-ExtraButtons');
    }
    if (css) {
      Engine.appendCSS(moduleName, css);
    } else {
      Engine.removeCSS(moduleName);
    }
  }

  function _get_doc_url(record) {
    var uuid = record.get('РП.Документ').get('ИдентификаторПереписки');
    return location.protocol + '//' + location.host + '/doc/' + uuid;
  }

  function _get_doc_name(record) {
    var docName = record.get('РП.Документ').get('Регламент').get('Название');
    return docName;
  }

  function _get_doc_date(record) {
    var doc_date = Engine.getDate(record.get('Документ.Дата'));
    return doc_date;
  }

  function _get_doc_number(record) {
    var numb = record.get('Документ.Номер') || record.get('Номер');
    return numb;
  }

  function _get_doc_author(record) {
    var author = record.get('Сотрудник.Название');
    return author;
  }

  function _get_doc_version(record) {
    var flds = record.get('РП.ПоляДляРендера');
    var milestone = ((flds || {})['ВехаДокумента'] || {}).name || '';
    var version = milestone.split(' ')[0] || '';
    if (!/^[\d.]+$/.test(version)) {
      if (!milestone && record.get('РП.ВехаДокумента')) {
        const enumerator = record.get('РП.ВехаДокумента').getEnumerator();
        while (enumerator.moveNext()) {
          milestone = enumerator.getCurrent();
          milestone = milestone.get('ДокументРасширение.Название');
          const __version = milestone.split(' ')[0] || '';
          if (/^[\d.]+$/.test(__version)) {
            version = __version;
            break;
          }
        }
      }
    }
    return version || 'dev';
  }

  function _get_doc_description(record) {
    var flds = record.get('РП.ПоляДляРендера');
    var description = (flds || {}).Description;
    if (!description) {
      description = Engine.cutOverflow(Engine.cutTags(record.get('РазличныеДокументы.Информация') || ''), 98, 1024);
    }
    return description;
  }

  function _get_doc_commit_description(record) {
    var docName = _get_doc_name(record);
    docName = ReplaceDocTypeName[docName] || docName;
    var docNumber = ' № ' + _get_doc_number(record);
    var version = ' веха ' + _get_doc_version(record);
    var date = ' от ' + _get_doc_date(record);
    var author = ' ' + _get_doc_author(record);
    var utl = _get_doc_url(record);
    var description = _get_doc_description(record);
    return docName + docNumber + version + date + author + '\n' + utl + '\n\n' + description;
  }

  function _get_doc_branch_name(record) {
    var version = _get_doc_version(record);
    var prefix = _get_doc_name(record) === 'Ошибка в разработку' ? 'bugfix' : 'feature';
    var docNumber = _get_doc_number(record);
    if (!/^[\d.]+$/.test(version)) {
      var msg = 'Не удалось определить ветку по вехе!';
      Engine.openInformationPopup(msg, 'error');
      throw Error(msg);
    }
    return version + '/' + prefix + '/' + (BranchNameUserLogin ? BranchNameUserLogin + '/' : '') + docNumber;
  }

  function _resolve_edo_dialog_record(elm) {
    var edo3Dialog = elm;
    while (edo3Dialog && !edo3Dialog.classList.contains('edo3-Dialog')) {
      edo3Dialog = edo3Dialog.parentElement;
    }
    if (edo3Dialog && edo3Dialog.controlNodes && edo3Dialog.controlNodes[0]) {
      edo3Dialog = edo3Dialog.controlNodes[0];
    } else {
      console.error(PARSE_ERROR);
      return false;
    }
    var record = (edo3Dialog.control || {}).record || (edo3Dialog.options || {}).record;
    if (!record) {
      console.error(PARSE_ERROR);
      return false;
    }
    return record;
  }

  function copyToClipboard(elm, action) {
    var msg = '';
    var text = '';

    var record = _resolve_edo_dialog_record(elm);

    switch (action) {
      case 'СommitMsg':
        msg = 'Описание скопировано в буфер обмена';
        text = _get_doc_commit_description(record);
        break;
      case 'TaskURL':
        msg = 'Ссылка скопирована в буфер обмена';
        text = _get_doc_url(record);
        break;
      case 'BranchName':
        if (!idReadedUserLogin) {
          return _readUserLogin(function () {
            copyToClipboard(elm, action);
          });
        }
        text = _get_doc_branch_name(record);
        msg = 'Имя ветки скопировано в буфер обмена:\n' + text;
        break;
    }
    Engine.copyToClipboard(text);
    Engine.openInformationPopup(msg);
  }

  function _readUserLogin(callback) {
    if (!idReadedUserLogin) {
      idReadedUserLogin = true;
      Engine.rpc.sbis({
        service: 'auth',
        method: 'САП.ТекущийПользователь',
        callback: function (data) {
          BranchNameUserLogin = data.getRow().get('ЛогинПользователя');
          callback();
        }
      });
    } else {
      callback();
    }
  }

  function _appendExtraButtons(moduleName, moduleProperty) {
    return function _appendExtraButtonsEH(elms) {
      for (let i = 0; i < elms.length; i++) {
        let elm = elms[i];
        _isTask(elm, moduleProperty, _appendExtraButtonsH(elm, moduleName, moduleProperty));
      }
    };
  }

  function _appendExtraButtonsH(elm, moduleName, moduleProperty) {
    return function (options = {}) {
      if (options.remove) {
        let btns = elm.querySelector('.SBIS-UI-Customizer .' + moduleName + '-ExtraButtons');
        if (btns) {
          btns.remove(moduleName);
        }
        elm.classList.remove(moduleName);
      } else {
        let btns = document.createElement('div');
        btns.className = 'SBIS-UI-Customizer ' + moduleName + '-ExtraButtons';
        btns.innerHTML = moduleProperty.ExtraButtonsHTML;
        btns.setAttribute('data-vdomignore', 'true');
        elm.insertBefore(btns, elm.children[0]);
        elm.classList.add('SBIS-UI-Customizer');
        elm.classList.add(moduleName);
      }
    };
  }

  function _appendButtonsClass(moduleName, moduleProperty) {
    return function _appendButtonsClassEH(elms) {
      for (let i = 0; i < elms.length; i++) {
        let elm = elms[i];
        _isTask(elm, moduleProperty, _appendButtonsClassH(elm, moduleName));
      }
    };
  }

  function _appendButtonsClassH(elm, moduleName) {
    return function (options = {}) {
      if (options.remove) {
        elm.classList.remove(moduleName);
      } else {
        elm.classList.add('SBIS-UI-Customizer');
        elm.classList.add(moduleName);
      }
    };
  }

  function _isTask(elm, moduleProperty, callback) {

    var edo3Dialog = elm;
    while (edo3Dialog && !edo3Dialog.classList.contains('edo3-Dialog')) {
      edo3Dialog = edo3Dialog.parentElement;
    }
    if (!edo3Dialog) {
      console.error(PARSE_ERROR);
      return false;
    } else if (edo3Dialog.controlNodes && edo3Dialog.controlNodes[0]) {
      edo3Dialog = edo3Dialog.controlNodes[0];
    } else {
      return setTimeout(() => {
        _isTask(elm, moduleProperty, callback);
        console.log(WAITING_COMPONENT);
      }, 500);
    }
    var record = (edo3Dialog.control || {}).record || (edo3Dialog.options || {}).record;
    if (!record) {
      console.error(PARSE_ERROR);
      return false;
    }

    let docName = _get_doc_name(record);
    if (moduleProperty.ApplyDocTypeName && ~moduleProperty.ApplyDocTypeName.indexOf(docName) ||
      moduleProperty.ExcludeDocTypeName && !~moduleProperty.ExcludeDocTypeName.indexOf(docName)) {

      var _beforeUpdate__Origin = edo3Dialog.control._beforeUpdate;
      var _beforeUnmount__Origin = edo3Dialog.control._beforeUnmount;
      var _beforeUpdate = edo3Dialog.control._beforeUpdate.bind(edo3Dialog.control);

      var task_key = edo3Dialog.control.key;

      edo3Dialog.control._beforeUpdate = function (...args) {
        var new_task_key = args[0].key;
        if (task_key !== new_task_key) {
          task_key = new_task_key;
          callback({ remove: true });
          edo3Dialog.control._beforeUpdate = _beforeUpdate__Origin;
          edo3Dialog.control._beforeUnmount = _beforeUnmount__Origin;
          for (var moduleName in allWaitHandlers) {
            allWaitHandlers[moduleName]([elm]);
          }
        }
        _beforeUpdate(...args);

      };
      edo3Dialog.control._beforeUnmount = function (...args) {
        edo3Dialog.control._beforeUpdate = _beforeUpdate__Origin;
        edo3Dialog.control._beforeUnmount = _beforeUnmount__Origin;
        edo3Dialog.control._beforeUnmount(...args);
      };


      return callback();
    }

  }

});
