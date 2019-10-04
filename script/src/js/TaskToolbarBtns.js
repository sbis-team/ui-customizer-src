UICustomizerDefine('TaskToolbarBtns', ['Engine'], function (Engine) {
  'use strict';

  const PARSE_ERROR = 'TaskToolbarBtns: Ошибка разбора карточки задачи';
  const ReplaceDocTypeName = {
    'Ошибка в разработку': 'Ошибка',
    'Задача в разработку': 'Задача'
  };
  const taskDialogClass = 'edo3-Dialog';
  const toolbarClass = '.edo3-Dialog__head-firstLine-buttons .controls-Toolbar';
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
      },
      PullRequest: {
        icon: 'git-pull-request'
      }
    },
    ApplyDocTypeName: ['Ошибка', 'Задача'],
    selectors: {
      'Print': '.SBIS-UI-Customizer-TaskToolbarBtns-TaskToolbarBtns .controls-Toolbar_item[title="Распечатать"]',
      'LinkOld': '.SBIS-UI-Customizer-TaskToolbarBtns-TaskToolbarBtns .controls-Toolbar_item[title="Скопировать в буфер"]',
      'Delete': '.SBIS-UI-Customizer-TaskToolbarBtns-TaskToolbarBtns .controls-Toolbar_item[title="Удалить"]'
    }
  };
  var BranchNameUserLogin = '';
  var idReadedUserLogin = false;
  var modulesProperties = {};
  var isListener = false;
  var taskChangeCache = new WeakMap();
  var toolbarSources = new WeakMap();

  return {
    applySettings: applySettings,
    copyToClipboard: copyToClipboard,
    createPullRequest: createPullRequest,
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
      }
    }

    if (addExtraButtons) {
      let extbtn = Engine.getCSS('TaskToolbarBtns-ExtraButtons');
      if (moduleName !== 'TaskToolbarBtns') {
        extbtn = extbtn.replace(/TaskToolbarBtns/g, moduleName);
      }
      css += extbtn;
    }
    if (css) {
      Engine.appendCSS(moduleName, css);
    } else {
      Engine.removeCSS(moduleName);
    }

    if (addExtraButtons || !!css) {
      modulesProperties[moduleName] = { moduleProperty, addExtraButtons, css: !!css };
    } else {
      delete modulesProperties[moduleName];
    }

    if (Object.keys(modulesProperties).length > 0) {
      if (!isListener) {
        const edo3Dialog = document.querySelector('.' + taskDialogClass);
        if (edo3Dialog) {
          taskFinderHandler({ srcElement: edo3Dialog });
        }
        document.addEventListener('DOMNodeInserted', taskFinderHandler);
        isListener = true;
      }
    } else {
      if (isListener) {
        document.removeEventListener('DOMNodeInserted', taskFinderHandler);
        isListener = false;
      }
    }

  }

  function taskFinderHandler(event) {
    const srcElement = event.srcElement;
    if (srcElement && srcElement.classList && srcElement.classList.contains(taskDialogClass)) {
      srcElement.addEventListener('DOMNodeRemovedFromDocument', taskRemoverHandler);
      srcElement.addEventListener('DOMSubtreeModified', taskModifierHandler);
    }
  }

  function taskRemoverHandler(event) {
    const srcElement = event.srcElement;
    if (srcElement && srcElement.classList && srcElement.classList.contains(taskDialogClass)) {
      srcElement.removeEventListener('DOMNodeRemovedFromDocument', taskRemoverHandler);
      srcElement.removeEventListener('DOMSubtreeModified', taskModifierHandler);
    }
  }

  function taskModifierHandler(event) {
    const edo3Dialog = event.currentTarget;
    if (edo3Dialog.controlNodes && edo3Dialog.controlNodes[0] && edo3Dialog.controlNodes[0].control) {
      const control = edo3Dialog.controlNodes[0].control;
      const controlRecord = control.record;
      if (controlRecord && controlRecord !== taskChangeCache.get(control)) {
        taskChangeCache.set(control, controlRecord);
        prepareTask(edo3Dialog, control);
      }
    }
  }

  function prepareTask(edo3Dialog, control) {
    const record = control.record;
    const docName = _get_doc_name(record);
    let moduleName = null;
    let moduleProps = null;
    for (const _moduleName in modulesProperties) {
      const props = modulesProperties[_moduleName];
      const moduleProperty = props.moduleProperty;
      if (moduleProperty.ApplyDocTypeName && ~moduleProperty.ApplyDocTypeName.indexOf(docName) ||
        moduleProperty.ExcludeDocTypeName && !~moduleProperty.ExcludeDocTypeName.indexOf(docName)) {
        moduleName = _moduleName;
        moduleProps = props;
        break;
      }
    }
    const toolbar = edo3Dialog.querySelector(toolbarClass);
    const oldBtns = toolbar.querySelector('.SBIS-UI-Customizer-TaskToolbarBtns-ExtraButtons');
    if (oldBtns) {
      oldBtns.remove();
    }
    toolbar.classList.forEach(clsName => {
      if (clsName.startsWith('SBIS-UI-Customizer-TaskToolbarBtns-')) {
        toolbar.classList.remove(clsName);
      }
    });
    if (moduleProps) {
      if (moduleProps.addExtraButtons) {
        let btns = document.createElement('div');
        btns.className = 'SBIS-UI-Customizer-TaskToolbarBtns-ExtraButtons ';
        btns.innerHTML = moduleProps.moduleProperty.ExtraButtonsHTML;
        btns.setAttribute('data-vdomignore', 'true');
        toolbar.insertBefore(btns, toolbar.children[0]);
      }
      if (moduleProps.css) {
        toolbar.classList.add('SBIS-UI-Customizer-TaskToolbarBtns-' + moduleName);
      }
    }
  }


  function _get_doc_url(record) {
    var uuid = record.get('РП.Документ').get('ИдентификаторПереписки');
    return location.protocol + '//' + location.host + '/doc/' + uuid;
  }

  function _get_doc_name(record) {
    var docName = record.get('РП.Документ').get('Регламент').get('Название');
    docName = ReplaceDocTypeName[docName] || docName;
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
    if (!description) {
      description = Engine.cutOverflow(Engine.textFromJSON(record.get('РазличныеДокументы.ИнформацияJSON') || '[]'), 98, 1024);
    }
    return description;
  }

  function _get_doc_commit_description(record) {
    var docName = _get_doc_name(record);
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
    var prefix = _get_doc_name(record) === 'Ошибка' ? 'bugfix' : 'feature';
    var docNumber = _get_doc_number(record);
    if (!/^[\d.]+$/.test(version)) {
      version = 'dev';
    }
    return version + '/' + prefix + '/' + (BranchNameUserLogin ? BranchNameUserLogin + '/' : '') + docNumber;
  }

  function _resolve_edo_dialog(elm) {
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
    return edo3Dialog;
  }

  function _resolve_edo_dialog_record(elm) {
    var edo3Dialog = _resolve_edo_dialog(elm);
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
        if (text.startsWith('dev')) {
          msg = 'Не удалось определить версию по вехе, для ветки указан \'dev\'.\n' + msg;
        }
        break;
    }
    Engine.copyToClipboard(text);
    Engine.openInformationPopup(msg);
  }

  function createPullRequest(elm) {
    var edo3Dialog = _resolve_edo_dialog(elm);
    var self = edo3Dialog.control;
    var record = self.record;
    var id = 'linkedDocuments';
    //copyToClipboard(elm, 'BranchName'); // Сделать авто-заполнение вехи в МР
    Engine.waitRequire(require => {
      require(['EDO3/Document/Toolbar/Source'], ToolbarSource => {
        let toolbarSource = toolbarSources.get(self);
        if (!toolbarSource) {
          toolbarSource = new ToolbarSource({
            options: {
              linkedDocs: self.linkedDocs,
              objectName: record && record.getModelField('РП.Документ/ИмяОбъекта'),
              ruleId: record && record.getModelField('ИдРегламента'),
              docId: record && record.getModelField('РП.Документ/ИдО'),
              isIncoming: record && record.getModelField('РП.Документ/Состояние/Подписание/Входящий'),
              id: id
            }
          });
          toolbarSources.set(self, toolbarSource);
        }
        toolbarSource.query().addCallback(data => {
          const enumerator = data.getEnumerator();
          while (enumerator.moveNext()) {
            const item = enumerator.getCurrent();
            if (item.get('title') === 'Merge request') {
              self._toolbarItemClickHandler({ target: edo3Dialog }, item);
              break;
            }
          }
        });
      });
    });
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

});
