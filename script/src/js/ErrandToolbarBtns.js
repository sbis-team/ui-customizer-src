UICustomizerDefine('ErrandToolbarBtns', ['Engine', 'TaskToolbarBtns'], function (Engine, Task) {
   "use strict";

   var property = {
      btns: {
         TaskURL: {
            icon: 'link'
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
      applySettings: applySettings
   };

   function applySettings(settings) {
      Task.applySettings(settings, 'ErrandToolbarBtns', property);
   }

});
