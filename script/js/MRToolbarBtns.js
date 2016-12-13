UICustomizerDefine('MRToolbarBtns', ['Engine', 'TaskToolbarBtns'], function (Engine, Task) {
   "use strict";

   var property = {
      btns: {
         TaskURL: {
            icon: 'link'
         }
      },
      ApplyDocTypeName: ['Merge request']
   };

   return {
      applySettings: applySettings
   };

   function applySettings(settings) {
      Task.applySettings(settings, 'MRToolbarBtns', property);
   }

});