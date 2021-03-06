UICustomizerDefine('Engine', function () {
  'use strict';

  const keyWordRE = /\{\{([\w-]+)\}\}/g;

  const migrateSettingsGroup = {};

  var verinfo, baseSettings, sources, gmapi, settings;

  var SbisService, InformationPopupManager;

  var _onload = false;
  var _onloadEvents = [];
  window.onload = function () {
    _onloadEvents.forEach(function (fn) {
      fn();
    });
    _onload = true;
    _onloadEvents = null;
  };

  var _waitRequire = false;
  var _waitRequireEvents = [];
  var _waitRequireFN = function _waitRequireFN() {
    if (_waitRequireEvents) {
      _waitRequireEvents.forEach(function (fn) {
        fn(window.require);
      });
    }
    _waitRequire = true;
    _waitRequireEvents = null;
  };
  var _waitRequireID = setInterval(function () {
    onload(function () {
      if (typeof window.require !== 'undefined') {
        _waitRequireFN();
        clearInterval(_waitRequireID);
      }
    });
  }, 100);

  var _waitID = null;
  var _wait = {};
  var _waitSync = {};
  var _waitOnce = {};
  document.addEventListener('DOMNodeInserted', function () {
    _waiting();
    _waitingSync();
  }, false);

  return {
    init: init,
    getVerInfo: getVerInfo,
    waitRequire: waitRequire,
    onload: onload,
    wait: wait,
    waitSync: waitSync,
    unsubscribeWait: unsubscribeWait,
    unsubscribeWaitSync: unsubscribeWaitSync,
    waitOnce: waitOnce,
    unsubscribeWaitOnce: unsubscribeWaitOnce,
    getHTML: getHTML,
    createElement: createElement,
    createComponent: createComponent,
    generateCSS: {
      custom: generateCSS_custom,
      displayNone: generateCSS_displayNone,
      visibilityHidden: generateCSS_visibilityHidden,
      inlineBlock: generateCSS_inlineBlock
    },
    hasCSS: hasCSS,
    getCSS: getCSS,
    appendCSS: appendCSS,
    removeCSS: removeCSS,
    getSVG: getSVG,
    getPNG: getPNG,
    getSettings: getSettings,
    setSetting: setSetting,
    cutTags: cutTags,
    textFromJSON: textFromJSON,
    cutOverflow: cutOverflow,
    copyToClipboard: copyToClipboard,
    getDate: getDate,
    rpc: {
      sbis: rpc_sbis
    },
    openInformationPopup: openInformationPopup
  };

  function init(_verinfo, _baseSettings, _sources, _gmapi) {
    /* jshint -W040 */
    delete this.init;
    verinfo = _verinfo;
    baseSettings = _baseSettings;
    sources = _sources;
    gmapi = _gmapi;
    settings = _copyObject(baseSettings);
    var localSettings = localStorage.getItem('SBIS-UI-Customizer-Settings');
    if (localSettings) {
      localSettings = JSON.parse(localSettings);
      _applySettings(settings, localSettings).then(function () {
        localStorage.setItem('SBIS-UI-Customizer-Settings', JSON.stringify(_minimizeSettings(settings)));
      }, console.error);
    }
    localStorage.setItem('SBIS-UI-Customizer-Settings', JSON.stringify(_minimizeSettings(settings)));
    var lastversion = localStorage.getItem('SBIS-UI-Customizer-LastVersion');
    if (lastversion || localSettings) {
      if (lastversion !== verinfo.version) {
        UICustomizerRequire(['VersionInformer'], function (VersionInformer) {
          VersionInformer.open();
        });
      }
    } else {
      localStorage.setItem('SBIS-UI-Customizer-LastVersion', verinfo.version);
    }
    UICustomizerRequire(['SettingsButton'], function (SettingsButton) {
      SettingsButton.init();
    });
    UICustomizerRequire(['HotKeys'], function (HotKeys) {
      HotKeys.init();
    });
  }

  function getVerInfo() {
    return _copyObject(verinfo);
  }

  function onload(fn) {
    if (_onload) {
      fn();
    } else {
      _onloadEvents.push(fn);
    }
  }

  function waitRequire(fn) {
    if (_waitRequire) {
      fn(window.require);
    } else {
      _waitRequireEvents.push(fn);
    }
  }

  function wait(selector, fn) {
    if (!(selector in _wait)) {
      _wait[selector] = new Set();
    }
    _wait[selector].add(fn);
    _waiting();
  }

  function waitSync(selector, fn) {
    if (!(selector in _waitSync)) {
      _waitSync[selector] = new Set();
    }
    _waitSync[selector].add(fn);
    _waitingSync();
  }

  function unsubscribeWait(selector, fn) {
    if (typeof (fn) === 'undefined') {
      delete _wait[selector];
    } else {
      if (selector in _wait) {
        let set = _wait[selector];
        set.delete(fn);
        if (!set.size) {
          delete _wait[selector];
        }
      }
    }
  }

  function unsubscribeWaitSync(selector, fn) {
    if (typeof (fn) === 'undefined') {
      delete _waitSync[selector];
    } else {
      if (selector in _waitSync) {
        let set = _waitSync[selector];
        set.delete(fn);
        if (!set.size) {
          delete _waitSync[selector];
        }
      }
    }
  }

  function waitOnce(selector, fn) {
    if (!(selector in _waitOnce)) {
      _waitOnce[selector] = new Set();
    }
    _waitOnce[selector].add(fn);
    _waiting();
  }

  function unsubscribeWaitOnce(selector, fn) {
    if (typeof (fn) === 'undefined') {
      delete _waitOnce[selector];
    } else {
      if (selector in _waitOnce) {
        let set = _waitOnce[selector];
        set.delete(fn);
        if (!set.size) {
          delete _waitOnce[selector];
        }
      }
    }
  }

  function _waiting() {
    if (!_waitID) {
      _waitID = setTimeout(_waitingHandler, 1);
    }
  }

  function _waitingHandler() {
    for (let i in _wait) {
      let elms = document.querySelectorAll(i);
      let ret_elms = [];
      for (let j = 0; j < elms.length; j++) {
        let elm = elms[j];
        if (!elm.UIC_Found) {
          elm.UIC_Found = true;
          ret_elms.push(elm);
        }
      }
      if (ret_elms.length > 0) {
        for (let item of _wait[i]) {
          item(ret_elms);
        }
      }
    }
    for (let i in _waitOnce) {
      let elm = document.querySelector(i);
      if (elm) {
        for (let item of _waitOnce[i]) {
          item(elm);
        }
        delete _waitOnce[i];
      }
    }
    _waitID = null;
  }

  function _waitingSync() {
    for (let i in _waitSync) {
      let elms = document.querySelectorAll(i);
      let ret_elms = [];
      for (let j = 0; j < elms.length; j++) {
        let elm = elms[j];
        if (!elm.UIC_Found) {
          elm.UIC_Found = true;
          ret_elms.push(elm);
        }
      }
      if (ret_elms.length > 0) {
        for (let item of _waitSync[i]) {
          item(ret_elms);
        }
      }
    }
  }

  function getHTML(name, data) {
    name += '.xhtml';
    if (name in sources.xhtml) {
      let xhtml = sources.xhtml[name];
      if (data) {
        xhtml = xhtml.replace(keyWordRE, function (str, key) {
          return key in data ? data[key] : str;
        });
      }
      return xhtml;
    } else {
      throw Error('Неизвестное имя файла: ' + name);
    }
  }

  function createElement(name, data) {
    var html = getHTML(name, data);
    var cnt = document.createElement('div');
    cnt.className = 'SBIS-UI-Customizer ' + name;
    cnt.innerHTML = html;
    return cnt;
  }

  function createComponent(name, data) {
    var html = getHTML(name, data);
    var cnt = document.createElement('div');
    cnt.id = 'SBIS-UI-Customizer-' + name;
    cnt.className = 'SBIS-UI-Customizer';
    cnt.innerHTML = html;
    return cnt;
  }

  function generateCSS_custom(selector, rule, value) {
    return `${selector} { ${rule}: ${value}; }`;
  }

  function generateCSS_displayNone(selector) {
    return `${selector} { display: none !important; }`;
  }

  function generateCSS_visibilityHidden(selector) {
    return `${selector} { visibility: hidden; }`;
  }

  function generateCSS_inlineBlock(selector) {
    return `${selector} { display: inline-block !important; }`;
  }

  function hasCSS(name) {
    name += '.css';
    return name in sources.css;
  }

  function getCSS(name, data) {
    name += '.css';
    if (name in sources.css) {
      var css = sources.css[name];
      if (data) {
        css = css.replace(keyWordRE, function (str, key) {
          return key in data ? data[key] : str;
        });
      }
      return css;
    } else {
      throw Error('Неизвестное имя файла: ' + name);
    }
  }

  function appendCSS(name, use_css) {
    let fullname = name + '.css';
    if (fullname in sources.css || use_css) {
      var id = `SBIS-UI-Customizer-${fullname}`;
      var elm = document.getElementById(id);
      if (!elm) {
        elm = document.createElement('style');
        elm.id = id;
        elm.type = 'text/css';
        elm.className = 'SBIS-UI-Customizer';
        document.getElementById('SBIS-UI-Customizer').appendChild(elm);
      }
      elm.innerHTML = use_css || getCSS(name);
    }
  }

  function removeCSS(name) {
    let fullname = name + '.css';
    var id = `SBIS-UI-Customizer-${fullname}`;
    var elm = document.getElementById(id);
    if (elm) {
      elm.remove();
    }
  }

  function getSVG(name) {
    name += '.svg';
    if (name in sources.svg) {
      return sources.svg[name];
    } else {
      throw Error('Неизвестное имя файла: ' + name);
    }
  }

  function getPNG(name) {
    name += '.png';
    if (name in sources.png) {
      return sources.png[name];
    } else {
      throw Error('Неизвестное имя файла: ' + name);
    }
  }

  function getSettings(minimize) {
    return minimize ? _minimizeSettings(_copyObject(settings)) : _copyObject(settings);
  }

  function setSetting(name, value) {
    var names = name.split('.');
    var setting = settings;
    var moduleSettings = null;
    while (names.length > 0) {
      setting = setting[names.shift()];
      if (setting.module) {
        moduleSettings = setting;
      }
      if (names.length > 0) {
        setting = setting.options;
      }
    }
    switch (setting.type) {
      case 'boolean':
        setting.value = !!value;
        break;
    }
    _applySettings_toModule(moduleSettings).then(function () {
      localStorage.setItem('SBIS-UI-Customizer-Settings', JSON.stringify(_minimizeSettings(settings)));
    }, console.error);
  }

  function cutTags(text) {
    return (text + '')
      .replace(/<\/?\w+[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\n\s+\n/g, '\n\n')
      .replace(/\n\n+/g, '\n\n')
      .replace(/\n\n+$/g, '\n');
  }

  function _parseJSON(json) {
    var text = '';
    for (let item of json) {
      let tag = item[0];
      let data = item.slice(1);
      switch (tag) {
        case 'p':
          for (let itemData of data) {
            let type = typeof itemData;
            if (type === 'string') {
              text += itemData;
            } else if (itemData instanceof Array) {
              text += _parseJSON(itemData[0] instanceof Array ? itemData : [itemData]);
            }
          }
          text += '\n';
          break;
        case 'a':
          text += data[0].href;
          break;
        default:
          for (let itemData of data) {
            let type = typeof itemData;
            if (type === 'string') {
              text += itemData;
            }
          }
      }
    }
    return text;
  }

  function textFromJSON(originText) {
    let json = [];
    try {
      json = JSON.parse(originText);
    } catch (error) {
      console.error(error.stack);
    }
    return _parseJSON(json);
  }

  function cutOverflow(text, maxLine, maxLength) {
    text = (text + '').split('\n');
    maxLine = maxLine || 80;
    maxLength = maxLength || 256;
    let result = [];
    for (let i = 0; i < text.length; i++) {
      let line = text[i];
      if (line.length > maxLine) {
        line = line.split(' ');
        let newLine = '';
        while (line.length > 0) {
          let word = line.shift();
          let testLine = newLine + (newLine ? ' ' : '') + word;
          if (testLine.length < maxLine) {
            newLine = testLine;
          } else {
            if (newLine) {
              result.push(newLine);
            }
            while (word.length > maxLine) {
              result.push(word.substring(0, maxLine));
              word = word.substring(maxLine);
            }
            newLine = word;
          }
        }
        result.push(newLine);
      } else {
        result.push(line);
      }
    }
    result = result.join('\n');
    if (result.length > maxLength) {
      result = result.substring(0, maxLength - 3) + '...';
    }
    return result;
  }

  function copyToClipboard(text) {
    gmapi.GM_setClipboard(text, { type: 'text', mimetype: 'text/plain' });
  }

  function getDate(date) {
    date = date || new Date();
    var d = ('0' + date.getDate()).slice(-2);
    var m = ('0' + (date.getMonth() + 1)).slice(-2);
    var y = String(date.getFullYear()).slice(-2);
    return d + '.' + m + '.' + y;
  }

  function rpc_sbis(obj) {
    if (!SbisService) {
      return waitRequire(function (require) {
        require(['Types/source'], function (svr) {
          SbisService = svr.SbisService;
          rpc_sbis(obj);
        });
      });
    }
    var service = obj.service ? ('/' + obj.service) : '';
    var method = obj.method.split('.');
    var params = obj.params || {};
    var callback = obj.callback;
    var errback = obj.errback;
    var bl = new SbisService({
      endpoint: {
        address: service + '/service/',
        contract: method[0]
      }
    }).call(method[1], params);
    if (callback) {
      bl.addCallback(callback);
    }
    if (errback) {
      bl.addErrback(errback);
    }
  }

  function openInformationPopup(text, status) {
    if (!InformationPopupManager) {
      return waitRequire(function (require) {
        require(['SBIS3.CONTROLS/Utils/InformationPopupManager'], function (ipm) {
          InformationPopupManager = ipm;
          return openInformationPopup(text, status);
        });
      });
    }
    status = status ? status : 'success';
    InformationPopupManager.showNotification({
      status: status,
      caption: text
    });
  }

  function _copyObject(obj) {
    var newObj = {};
    for (let name in obj) {
      let val = obj[name];
      if (val instanceof Array) {
        newObj[name] = obj[name].slice();
      } else if (typeof val === 'object') {
        newObj[name] = _copyObject(obj[name]);
      } else {
        newObj[name] = obj[name];
      }
    }
    return newObj;
  }

  function _applySettings(target, source, ptName) {
    let queue = [];
    for (let name in target) {
      let sName = name;
      if (!(sName in source)) {
        if (name in migrateSettingsGroup) {
          sName = migrateSettingsGroup[name];
        } else {
          continue;
        }
      }
      let fName = ptName ? `${ptName}.${name}` : name;
      let tVal = target[name];
      let sVal = source[sName];
      let tType = typeof tVal;
      let sType = typeof sVal;
      if (
        tType === 'object' &&
        'options' in tVal &&
        sType === 'object'
      ) {
        queue.push(_applySettings(tVal.options, sVal, fName));
      } else if (
        tType === 'object' &&
        'value' in tVal &&
        sType !== 'object' &&
        typeof tVal.value === sType
      ) {
        tVal.value = sVal;
      } else {
        console.error(Error(`Неверный тип опции ${fName}`));
      }
      if (tVal.module) {
        queue.push(_applySettings_toModule(tVal));
      }
    }
    return Promise.all(queue);
  }

  function _applySettings_toModule(moduleSettings) {
    return new Promise(function (resolve) {
      try {
        UICustomizerRequire([moduleSettings.module], function (module) {
          try {
            module.applySettings.call(module, moduleSettings);
          } catch (err) {
            console.error(err);
          }
          resolve();
        });
      } catch (err) {
        console.error(err);
        resolve();
      }
    });
  }

  function _minimizeSettings(conf) {
    var min = {};
    for (let name in conf) {
      let obj = conf[name];
      if ('value' in obj) {
        min[name] = obj.value;
      } else if ('options' in obj) {
        min[name] = _minimizeSettings(obj.options);
      }
    }
    return min;
  }

});
