UICustomizerDefine('SettingsDialog', ['Engine', 'SocNet'], function (Engine, SocNet) {
  'use strict';

  var dialog;

  return {
    open: open,
    close: close,
    toggle: toggle,
    toggleSection: toggleSection,
    onchangeOptionBoolean: onchangeOptionBoolean
  };

  function open() {
    var up = document.querySelector('div[templatename="AccountsManagement/User/Panel"]');
    if (up) {
      up.wsControl.hide();
    }
    if (dialog) {
      dialog.style.display = '';
    } else {
      _createDialog();
    }
    _resize();
    window.addEventListener('resize', _resize);
  }

  function close() {
    dialog.style.display = 'none';
    window.removeEventListener('resize', _resize);
  }

  function toggle() {
    if (!dialog || dialog.style.display === 'none') {
      open();
    } else {
      close();
    }
  }

  function toggleSection(section) {
    var classList = section.parentElement.classList;
    if (classList.contains('active')) {
      classList.remove('active');
    } else {
      classList.add('active');
    }
  }

  function onchangeOptionBoolean(element) {
    var optname = element.getAttribute('optname');
    var value = element.checked;
    Engine.setSetting(optname, value);
  }

  function _createDialog() {
    var verinfo = Engine.getVerInfo();
    Engine.appendCSS('SettingsDialog');
    dialog = document.createElement('div');
    dialog.id = 'SBIS-UI-Customizer-SettingsDialog-Area';
    var template = Engine.createComponent('SettingsDialog');
    var feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.innerHTML = SocNet.getFeedbackButtons();
    template.appendChild(feedback);
    _buildSettings(template);
    template.appendChild(Engine.createElement('SettingsDialog-footer', {
      version: verinfo.version
    }));
    dialog.appendChild(template);
    document.body.appendChild(dialog);
    open();
  }

  function _buildSettings(parent) {
    var stgs = Engine.getSettings();
    var container = document.createElement('div');
    container.className = 'Settings-panel';
    for (let i in stgs) {
      stgs[i].fullName = i;
      container.appendChild(_buildComponent(stgs[i]));
    }
    parent.appendChild(container);
  }

  function _buildComponent(options) {
    switch (options.view) {
      case 'section':
        return _buildSection(options);
      case 'group':
        return _buildGroup(options);
      case 'block':
        return _buildBlock(options);
      case 'option':
        return _buildOption(options);
    }
  }

  function _buildSection(options) {
    var section = Engine.createElement('SettingsDialog-section', {
      title: options.title
    });
    var slider = document.createElement('div');
    slider.className = 'slider';
    for (let i in options.options) {
      options.options[i].fullName = options.fullName + '.' + i;
      slider.appendChild(_buildComponent(options.options[i]));
    }
    section.appendChild(slider);
    return section;
  }

  function _buildGroup(options) {
    var group = Engine.createElement('SettingsDialog-group', {
      title: options.title
    });
    var box = document.createElement('div');
    box.className = 'box';
    for (let i in options.options) {
      options.options[i].fullName = options.fullName + '.' + i;
      box.appendChild(_buildComponent(options.options[i]));
    }
    group.appendChild(box);
    return group;
  }

  function _buildBlock(options) {
    var block = Engine.createElement('SettingsDialog-block', {
      title: options.title
    });
    var box = document.createElement('div');
    box.className = 'box';
    for (let i in options.options) {
      options.options[i].fullName = options.fullName + '.' + i;
      box.appendChild(_buildComponent(options.options[i]));
    }
    block.appendChild(box);
    return block;
  }

  function _buildOption(options) {
    var tmpl = `SettingsDialog-option-${options.type}`;
    var option = Engine.createElement(tmpl, {
      title: options.title,
      optname: options.fullName,
      value: options.value ? 'checked' : ''
    });
    return option;
  }

  function _resize() {
    var panel = dialog.children[0].children[3];
    panel.style['max-height'] = (document.body.clientHeight - 86) + 'px';
  }

});
