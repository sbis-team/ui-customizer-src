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
      'Schedule': 'div.SBIS-UI-Customizer.ErrandToolbarBtns span[data-id="edoShowDocTime"]',
      'Monitoring': 'div.SBIS-UI-Customizer.ErrandToolbarBtns span[data-id="edoShowMonitoringDialog"]',
      'Agreement': 'div.SBIS-UI-Customizer.ErrandToolbarBtns span[data-id="edoSendToAgreement"]',
      'Print': 'div.SBIS-UI-Customizer.ErrandToolbarBtns span[data-id="edoPrintDocument"]',
      'Save': 'div.SBIS-UI-Customizer.ErrandToolbarBtns span[data-id="edoSaveDocumentOnDisk"]',
      'LinkOld': 'div.SBIS-UI-Customizer.ErrandToolbarBtns span[data-id="edoGetLink"]',
      'Delete': 'div.SBIS-UI-Customizer.ErrandToolbarBtns span[data-id="edoDeleteDocument"]'
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
    var card = elm;
    while (!card.wsControl && card.parentElement) {
      card = card.parentElement;
    }
    if (!card || !card.wsControl) {
      throw new Error('Не удалось распознать карточку задачи');
    }
    card = card.wsControl;
    var record = card.getLinkedContext().getValue('record');
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
