UICustomizerDefine('ErrandToolbarBtns', ['Engine', 'TaskToolbarBtns'], function (Engine, Task) {
  'use strict';

  const PARSE_ERROR = 'TaskToolbarBtns: Ошибка разбора карточки задачи';
  var property = {
    btns: {
      TaskURL: {
        icon: 'link'
      },
      CopyInfo: {
        icon: 'info'
      }
    },
    ExcludeDocTypeName: ['Merge request', 'Ошибка в разработку', 'Задача в разработку'],
    selectors: {
      'Print': 'div.SBIS-UI-Customizer.TaskToolbarBtns .controls-Toolbar_item[title="Распечатать"]',
      'LinkOld': 'div.SBIS-UI-Customizer.TaskToolbarBtns .controls-Toolbar_item[title="Скопировать в буфер"]',
      'Delete': 'div.SBIS-UI-Customizer.TaskToolbarBtns .controls-Toolbar_item[title="Удалить"]'
    }
  };

  return {
    applySettings: applySettings,
    copyToClipboard: copyToClipboard
  };

  function applySettings(settings) {
    Task.applySettings(settings, 'ErrandToolbarBtns', property);
  }

  function copyToClipboard(elm, action) {
    var docName, number, face, info_text, url, msg = '';
    var text = '';

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
    var record = (edo3Dialog.options || {}).record;
    if (!record) {
      console.error(PARSE_ERROR);
      return false;
    }

    switch (action) {
      case 'CopyInfo':
        msg = 'Описание скопировано в буфер обмена';
        docName = record.get('РП.Документ').get('Регламент').get('Название');
        number =
          (record.has('Номер') ? record.get('Номер') : '') ||
          '';
        face =
          (record.has('ЛицоСоздал.Название') ? record.get('ЛицоСоздал.Название') : '') ||
          (record.has('Лицо1.Название') ? record.get('Лицо1.Название') : '') ||
          (record.has('Автор.Название') ? record.get('Автор.Название') : '') ||
          '';
        if (docName === 'Обращение') {
          let clt = record.get('Лицо.Название') || '';
          face = clt ? (face + ' (' + clt + ')') : face;
        }
        info_text =
          (record.has('РазличныеДокументы.Информация') ? record.get('РазличныеДокументы.Информация') : '') ||
          (record.has('Примечание') ? record.get('Примечание') : '') ||
          (record.has('Описание') ? record.get('Описание') : '') ||
          (record.has('ДокументРасширение.Название') ? record.get('ДокументРасширение.Название') : '') ||
          '';
        url = record.get('ИдентификаторДокумента');
        number = number ? (' № ' + number) : '';
        face = face ? (' ' + face) : '';
        info_text = Engine.cutOverflow(Engine.cutTags(info_text), 98, 1024);
        if (url) {
          url = location.protocol + '//' + location.host + '/opendoc.html?guid=' + url;
        } else {
          url = '(Нет ссылки на документ, т.к. он не запущен в ЭДО)';
        }
        text =
          docName + number + ' от ' +
          Engine.getDate(record.get('ДокументРасширение.ДатаВремяСоздания')) +
          face + '\n' + url + '\n\n' + info_text;
        break;
    }
    Engine.copyToClipboard(text);
    Engine.openInformationPopup(msg);
  }

});
