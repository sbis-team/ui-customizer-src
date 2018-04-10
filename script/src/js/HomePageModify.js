UICustomizerDefine('HomePageModify', ['Engine'], function (Engine) {
  'use strict';

  return {
    applySettings: applySettings
  };

  function applySettings(settings) {
    var css = '';
    let news = settings.options.News.options;
    /*
    if (news.HideAuthor.value && news.HideFooterBtn.value) {
       css += Engine.getCSS('HomePageModify-FixHeight');
    }
    */
    for (let groupName in settings.options) {
      let group = settings.options[groupName];
      for (let name in group.options) {
        let cssname = 'HomePageModify-' + name;
        if (group.options[name].value && Engine.hasCSS(cssname)) {
          css += Engine.getCSS(cssname);
        }
      }
    }
    /*
    if (news.HideAuthor.value && news.SlimBorder.value) {
       css += Engine.generateCSS.custom(
          '.sn-NewsPage .sn-DraftIcon, .sn-NewsPage .sn-FavoriteIcon, .sn-NewsPage .sn-PinIcon',
          'top',
          '0px !important'
       );
    }
    */
    if (css) {
      Engine.appendCSS('HomePageModify', css);
    } else {
      Engine.removeCSS('HomePageModify');
    }
    Engine.waitRequire(function (require) {
      require(['WS.Data/Source/SbisService', 'Core/UserConfig'], function (SbisService, UserConfig) {
        let ifColumn2 = document.querySelector('.sn-NewsLeftColumn');
        if (news.InOneColumn.value) {
          if (ifColumn2) {
            UserConfig.setParam('OnlyOneColumn', 'true');
            toggleColumn(true);
          }
        } else {
          if (!ifColumn2) {
            UserConfig.removeParam('OnlyOneColumn');
            toggleColumn(false);
          }
        }
      });
    });
  }

  function toggleColumn(isOne) {
    var news = document.querySelector('.n-NewsPageList');
    if (news && news.wsControl) {
      news.wsControl._setOneColumnMode(isOne, false);
    }
  }

});
