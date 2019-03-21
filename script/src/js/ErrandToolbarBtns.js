UICustomizerDefine('ErrandToolbarBtns', ['Engine', 'TaskToolbarBtns'], function (Engine, Task) {
  'use strict';

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
      'Print': '.SBIS-UI-Customizer-TaskToolbarBtns-ErrandToolbarBtns .controls-Toolbar_item[title="Распечатать"]',
      'LinkOld': '.SBIS-UI-Customizer-TaskToolbarBtns-ErrandToolbarBtns .controls-Toolbar_item[title="Скопировать в буфер"]',
      'Delete': '.SBIS-UI-Customizer-TaskToolbarBtns-ErrandToolbarBtns .controls-Toolbar_item[title="Удалить"]'
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
    var docName, number, date, face, info_text, url, msg = '';
    var text = '';

    var record = Task._resolve_edo_dialog_record(elm);

    switch (action) {
      case 'CopyInfo':
        msg = 'Описание скопировано в буфер обмена';
        docName = Task._get_doc_name(record);
        date = Task._get_doc_date(record);
        number = Task._get_doc_number(record);
        face = Task._get_doc_author(record) ||
          record.get('ЛицоСоздал.Название') ||
          record.get('Лицо1.Название') ||
          record.get('Автор.Название') ||
          '';
        if (docName === 'Обращение') {
          let clt = record.get('Лицо.Название') || '';
          face = clt ? (face + ' (' + clt + ')') : face;
        }
        info_text = Task._get_doc_description(record) ||
          record.get('РазличныеДокументы.Информация') ||
          record.get('Примечание') ||
          record.get('Описание') ||
          record.get('ДокументРасширение.Название') ||
          '';
        url = Task._get_doc_url(record);
        number = number ? (' № ' + number) : '';
        face = face ? (' ' + face) : '';
        info_text = Engine.cutOverflow(Engine.cutTags(info_text), 98, 1024);
        text =
          docName + number + ' от ' + date +
          face + '\n' + url + '\n\n' + info_text;
        break;
    }
    Engine.copyToClipboard(text);
    Engine.openInformationPopup(msg);
  }

});
