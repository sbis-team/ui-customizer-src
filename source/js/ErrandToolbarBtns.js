UICustomizerDefine('ErrandToolbarBtns', ['Engine', 'TaskToolbarBtns'], function (Engine, Task) {
   "use strict";

   var property = {
      btns: {
         TaskURL: {
            icon: 'link'
         }
      },
      ExcludeDocTypeName: ['Merge request', 'Ошибка в разработку', 'Задача в разработку']
   };

   return {
      applySettings: applySettings
   };

   function applySettings(settings) {
      Task.applySettings(settings, 'ErrandToolbarBtns', property);
   }

});