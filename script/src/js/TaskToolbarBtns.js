UICustomizerDefine('TaskToolbarBtns', ['Engine'], function (Engine) {
   "use strict";

   const PARSE_ERROR = 'TaskToolbarBtns: Ошибка разбора карточки задачи';
   const ReplaceDocTypeName = {
      'Ошибка в разработку': 'Ошибка',
      'Задача в разработку': 'Задача'
   };
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
         'Schedule': 'div.SBIS-UI-Customizer.TaskToolbarBtns i[data-id="edoShowDocTime"]',
         'Monitoring': 'div.SBIS-UI-Customizer.TaskToolbarBtns i[data-id="edoShowMonitoringDialog"]',
         'Agreement': 'div.SBIS-UI-Customizer.TaskToolbarBtns i[data-id="edoSendToAgreement"]',
         'Print': 'div.SBIS-UI-Customizer.TaskToolbarBtns i[data-id="edoPrintDocument"]',
         'Save': 'div.SBIS-UI-Customizer.TaskToolbarBtns i[data-id="edoSaveDocumentOnDisk"]',
         'LinkOld': 'div.SBIS-UI-Customizer.TaskToolbarBtns i[data-id="edoGetLink"]',
         'Delete': 'div.SBIS-UI-Customizer.TaskToolbarBtns i[data-id="edoDeleteDocument"]'
      }
   };
   var BranchNameUserLogin = '';
   var idReadedUserLogin = false;

   return {
      applySettings: applySettings,
      copyToClipboard: copyToClipboard
   };

   function applySettings(settings, moduleName, moduleProperty) {
      var group, css = '';
      moduleName = moduleName ? moduleName : 'TaskToolbarBtns';
      moduleProperty = moduleProperty ? moduleProperty : property;
      group = settings.options.Show;
      for (let name in group.options) {
         if (group.options[name].value) {
            css += Engine.generateCSS.inlineBlock(moduleProperty.selectors[name]);
         }
      }
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
            Engine.unsubscribeWait('.edo-Dialog__toolbar', moduleProperty.WaitHandler);
         }
         moduleProperty.WaitHandler = _appendExtraButtons(moduleName, moduleProperty);
         Engine.wait('.edo-Dialog__toolbar', moduleProperty.WaitHandler);
      } else {
         if (moduleProperty.WaitHandler) {
            Engine.unsubscribeWait('.edo-Dialog__toolbar', moduleProperty.WaitHandler);
            delete moduleProperty.WaitHandler;
         }
         if (css) {
            moduleProperty.WaitHandler = _appendButtonsClass(moduleName, moduleProperty);
            Engine.wait('.edo-Dialog__toolbar', moduleProperty.WaitHandler);
         }
         Engine.removeByQuery('.SBIS-UI-Customizer.' + moduleName + '-ExtraButtons');
      }
      if (css) {
         Engine.appendCSS(moduleName, css);
      } else {
         Engine.removeCSS(moduleName);
      }
   }

   function copyToClipboard(elm, action) {
      var msg = '';
      var text = '';
      var opener = elm.parentElement.parentElement.wsControl;
      var record = opener.getLinkedContext().getValue('record');
      switch (action) {
         case 'СommitMsg':
            msg = 'Описание скопировано в буфер обмена';
            let docName = record.get('РП.Документ').get('Регламент').get('Название');
            docName = ReplaceDocTypeName[docName] || docName;
            text =
               docName + ' № ' +
               record.get('Номер') +
               ' v' + _extractVersionName(record.get('РП.ВехаДокумента')) + ' от ' +
               Engine.getDate(record.get('ДокументРасширение.ДатаВремяСоздания')) + ' ' +
               record.get('ЛицоСоздал.Название') + '\n' +
               location.protocol + '//' +
               location.host + '/opendoc.html?guid=' +
               record.get('ИдентификаторДокумента') + '\n\n' +
               Engine.cutOverflow(Engine.cutTags(record.get('РазличныеДокументы.Информация')), 98, 1024);
            break;
         case 'TaskURL':
            msg = 'Ссылка скопирована в буфер обмена';
            text =
               location.protocol + '//' +
               location.host + '/opendoc.html?guid=' +
               record.get('ИдентификаторДокумента');
            break;
         case 'BranchName':
            if (!idReadedUserLogin) {
               return _readUserLogin(function () {
                  copyToClipboard(elm, action);
               });
            }
            msg = 'Имя ветки скопировано в буфер обмена';
            text =
               _extractVersionName(record.get('РП.ВехаДокумента')) + '/' +
               (record.get('РП.Документ').get('Регламент').get('Название') === 'Ошибка в разработку' ? 'bugfix' : 'feature') + '/' +
               (BranchNameUserLogin ? BranchNameUserLogin + '/' : '') +
               record.get('Номер');
            break;
      }
      Engine.copyToClipboard(text);
      Engine.openInformationPopup(rk(msg));
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

   function _extractVersionName(milestones) {
      let versionName = 'dev';
      let version = Infinity;
      milestones.each(function (record) {
         let curNames = record.get('ДокументРасширение.Название').replace(/[ \(\)]/g, '\n').split('\n');
         for (let i = 0; i < curNames.length; i++) {
            let curName = curNames[i].replace(/[^\d\.]/g, '').replace(/^[\.]+/, '').replace(/[\.]+$/, '');
            if (curName) {
               let n = Number(curName.replace(/\./g, ''));
               if (!isNaN(n)) {
                  if (n < version) {
                     version = n;
                     versionName = curName;
                  }
                  break;
               }
            }
         }
      });
      return versionName;
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
      return function () {
         let btns = document.createElement('div');
         btns.className = 'SBIS-UI-Customizer ' + moduleName + '-ExtraButtons';
         btns.innerHTML = moduleProperty.ExtraButtonsHTML;
         elm.insertBefore(btns, elm.children[0]);
         elm.classList.add('SBIS-UI-Customizer');
         elm.classList.add(moduleName);
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
      return function () {
         elm.classList.add('SBIS-UI-Customizer');
         elm.classList.add(moduleName);
      };
   }

   function _isTask(elm, moduleProperty, callback) {
      function checkControl() {
         var ctx;
         if (elm.wsControl && (ctx = elm.wsControl.getLinkedContext())) {
            record = ctx.getValue('record');
            if (record && record.getIdProperty && ~['@СвязьПапок', '@Документ'].indexOf(record.getIdProperty())) {
               check(record);
            } else {
               ctx.subscribe('onFieldChange', checkEvent);
            }
         } else {
            console.error(PARSE_ERROR);
         }
      }

      function checkEvent(e, fieldName, val) {
         /*jshint -W040 */
         if (fieldName === 'record' && val.getIdProperty() === '@Документ') {
            this.unsubscribe('onFieldChange', checkEvent);
            check(val);
         }
      }

      function check(record) {
         let docName = record.get('РП.Документ').get('Регламент').get('Название');
         if (moduleProperty.ApplyDocTypeName && ~moduleProperty.ApplyDocTypeName.indexOf(docName)) {
            return callback();
         }
         if (moduleProperty.ExcludeDocTypeName && !~moduleProperty.ExcludeDocTypeName.indexOf(docName)) {
            return callback();
         }
      }
      var record, docName;
      if (location.pathname === '/opendoc.html' && !elm.wsControl) {
         return require(['js!SBIS3.CORE.Control'], function () {
            $ws.single.ControlStorage.waitChildByName('ServiceButtons').addCallback(function () {
               checkControl();
            });
         });
      }
      var card = elm.parentElement;
      while (card && card.getAttribute('templatename') !== 'js!SBIS3.EDO.FTask' && card.parentElement) {
         card = card.parentElement;
      }
      if (card && card.getAttribute('templatename') === 'js!SBIS3.EDO.FTask') {
         try {
            record = card.wsControl._options.componentOptions.record;
            if (record) {
               return check(record);
            }
         } catch (e) {}
      }
      checkControl();
   }

});
