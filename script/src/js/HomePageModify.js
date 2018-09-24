UICustomizerDefine('HomePageModify', ['Engine'], function (Engine) {
  'use strict';
  /*
    let __oneColumnMode = false;
    let _changeColumnsOrigon;
  */
  return {
    applySettings: applySettings
  };

  function applySettings(settings) {
    var css = '';
    /*let news = settings.options.News.options;*/

    for (let groupName in settings.options) {
      let group = settings.options[groupName];
      for (let name in group.options) {
        let cssname = 'HomePageModify-' + name;
        if (group.options[name].value && Engine.hasCSS(cssname)) {
          css += Engine.getCSS(cssname);
        }
      }
    }

    if (css) {
      Engine.appendCSS('HomePageModify', css);
    } else {
      Engine.removeCSS('HomePageModify');
    }
    /*
    Engine.unsubscribeWait('.feed-LeftItems', oneColumnMode);
    __oneColumnMode = news.InOneColumn.value;
    if (__oneColumnMode) {
      if (document.querySelector('.feed-LeftItems')) {
        oneColumnMode();
      }
      Engine.wait('.feed-LeftItems', oneColumnMode);
    } else {
      oneColumnMode();
    }
    */
  }
  /*
  function oneColumnMode() {
    let news = document.querySelector('.feed-All .ws-ListView');
    if (news && news.controlNodes && news.controlNodes[0] && news.controlNodes[0].control) {
      news = news.controlNodes[0].control;
      if (!_changeColumnsOrigon) {
        _changeColumnsOrigon = news._changeColumns;
        news._changeColumns = (clientWidth) => {
          if (!__oneColumnMode) {
            _changeColumnsOrigon.call(news, clientWidth);
          }
        };
      }
      if (news.oneColumnMode !== __oneColumnMode) {
        news.changeColumnMode(__oneColumnMode);
      }
    } else {
      setTimeout(oneColumnMode, 10);
    }
  }
  */
});
