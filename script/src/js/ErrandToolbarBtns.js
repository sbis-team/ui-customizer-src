UICustomizerDefine('ErrandToolbarBtns', ['Engine', 'TaskToolbarBtns'], function (Engine, Task) {
   "use strict";

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
      var msg = '';
      var text = '';
      var opener = elm.parentElement.parentElement.wsControl;
      var record = opener.getLinkedContext().getValue('record');
      switch (action) {
         case 'CopyInfo':
            msg = 'Описание скопировано в буфер обмена';
            let docName = record.get('РП.Документ').get('Регламент').get('Название');
            let number =
               (record.has('Номер') ? record.get('Номер') : '') ||
               '';
            let face =
               (record.has('ЛицоСоздал.Название') ? record.get('ЛицоСоздал.Название') : '') ||
               (record.has('Лицо1.Название') ? record.get('Лицо1.Название') : '') ||
               (record.has('Автор.Название') ? record.get('Автор.Название') : '') ||
               '';
            if (docName === 'Обращение') {
               let clt = record.get('Лицо.Название') || '';
               face = clt ? (face + ' (' + clt + ')') : face;
            }
            let info_text =
               (record.has('РазличныеДокументы.Информация') ? record.get('РазличныеДокументы.Информация') : '') ||
               (record.has('Примечание') ? record.get('Примечание') : '') ||
               (record.has('ДокументРасширение.Название') ? record.get('ДокументРасширение.Название') : '') ||
               '';
            number = number ? (' № ' + number) : '';
            face = face ? (' ' + face) : '';
            info_text = Engine.cutOverflow(Engine.cutTags(info_text), 98, 1024);
            debugger
            text =
               docName + number + ' от ' +
               Engine.getDate(record.get('ДокументРасширение.ДатаВремяСоздания')) +
               face + '\n' +
               location.protocol + '//' +
               location.host + '/opendoc.html?guid=' +
               record.get('ИдентификаторДокумента') + '\n\n' +
               info_text;
            break;
      }
      Engine.copyToClipboard(text);
      Engine.openInformationPopup(rk(msg));
   }

});
