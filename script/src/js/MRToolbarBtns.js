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
         'Schedule': 'div.SBIS-UI-Customizer.MRToolbarBtns i[data-id="edoShowDocTime"]',
         'Monitoring': 'div.SBIS-UI-Customizer.MRToolbarBtns i[data-id="edoShowMonitoringDialog"]',
         'Agreement': 'div.SBIS-UI-Customizer.MRToolbarBtns i[data-id="edoSendToAgreement"]',
         'Print': 'div.SBIS-UI-Customizer.MRToolbarBtns i[data-id="edoPrintDocument"]',
         'Save': 'div.SBIS-UI-Customizer.MRToolbarBtns i[data-id="edoSaveDocumentOnDisk"]',
         'LinkOld': 'div.SBIS-UI-Customizer.MRToolbarBtns i[data-id="edoGetLink"]',
         'Delete': 'div.SBIS-UI-Customizer.MRToolbarBtns i[data-id="edoDeleteDocument"]'
      }
   };

   return {
      applySettings: applySettings
   };

   function applySettings(settings) {
      Task.applySettings(settings, 'MRToolbarBtns', property);
   }

});
