/* globals UICustomizerEvent */
UICustomizerDefine('SocNet', ['Engine'], function (Engine) {
  'use strict';

  var GroupUUID = '2d110a8e-7edb-469a-a3cb-5eb6d8095c10';
  var ChatUUID = '3af31f44-c91a-4bbf-8470-3dd423f0b6eb';
  var AuthorUUID = 'd7dde799-21cb-49ea-89cf-de56e4f7f78b';

  if (location.host === 'test-online.sbis.ru') {
    GroupUUID = 'ceeeedd4-8d0e-4dd0-9635-88f1758c3ef3';
    ChatUUID = '83adaca3-d02b-490b-bbbf-95ce9953797d';
    AuthorUUID = '8cab8a51-da51-40fd-bef3-6f090edbdeaa';
  }

  var feedbackButtons = '';

  Engine.appendCSS('SocNet');

  return {
    getFeedbackButtons: getFeedbackButtons,
    sendFeedback: sendFeedback
  };

  function getFeedbackButtons() {
    if (!feedbackButtons) {
      feedbackButtons = Engine.getHTML('SocNet-FeedbackButtons', {
        //'LikeIt': Engine.getSVG('thumbsup'),
        'SendQuestion': Engine.getSVG('comment-discussion'),
        //'SendFeedback': Engine.getSVG('megaphone'),
        'ReportError': Engine.getSVG('bug')
      });
    }
    return feedbackButtons;
  }

  function sendFeedback(elm, action) {
    switch (action) {
      case 'SendQuestion':
        _showInputDialog('Задать вопрос', 'Задайте вопрос, оставьте предложение, пожелание...', function (msg) {
          _SendQuestion(msg);
        });
        break;
      case 'SendFeedback':
        _showInputDialog('Оставить отзыв', 'Оставьте отзыв о данном плагине, опишите что Вам понравилось, а что нет...', function (msg) {
          _SendFeedback(msg);
        });
        break;
      case 'ReportError':
        _showInputDialog('Сообщить о проблеме', 'Опишите проблему возникшую с данным плагином...', function (msg) {
          _ReportError(msg);
        });
    }
  }

  function _showInputDialog(title, hint, callback) {
    var dlg = document.createElement('div');
    dlg.className = "SBIS-UI-Customizer-SocNet-InputDialog";
    dlg.innerHTML = Engine.getHTML('SocNet-InputDialog', {
      'title': title,
      'hint': hint
    });
    dlg.children[3].onkeydown = function (event) {
      if (event.ctrlKey && event.keyCode === 13) {
        if (dlg.children[3].value) {
          callback(dlg.children[3].value);
          dlg.remove();
        }
      }
    };
    dlg.children[1].onclick = function () {
      if (dlg.children[3].value) {
        callback(dlg.children[3].value);
        dlg.remove();
      }
    };
    document.body.appendChild(dlg);
    dlg.children[3].focus();
  }

  function _SendQuestion(msg) {
    _JoinToGroup(function () {
      Engine.rpc.sbis({
        method: 'Персона.СОтправить',
        params: {
          "Получатели": [],
          "Текст": msg,
          "Диалог": ChatUUID,
          "Документ": null,
          "Сообщение": null,
          "Файлы": [],
          "Опции": {
            "d": [
              false,
              false
            ],
            "s": [
              { "t": "Логическое", "n": "МассовоеСообщение" },
              { "t": "Логическое", "n": "СлитьСПредыдущим" }
            ],
            "_type": "record"
          }
        },
        callback: function () {
          UICustomizerEvent('SettingsDialog', 'close');
          Engine.openInformationPopup('Ваше сообщение успешно отправлено в чат "SBIS UI-Customizer"');
        }
      });
    });
  }

  function _SendFeedback(msg) {
    _JoinToGroup(function () {
      Engine.rpc.sbis({
        method: 'Event.CreateNews',
        params: {
          "Object": {
            "d": [
              GroupUUID,
              null,
              1,
              1,
              false,
              msg
            ],
            "s": [
              { "n": "Channel", "t": "UUID" },
              { "n": "News", "t": "UUID" },
              { "n": "Visibility", "t": "Число целое" },
              { "n": "EventType", "t": "Число целое" },
              { "n": "FromGroup", "t": "Логическое" },
              { "n": "Text", "t": "Строка" }
            ],
            "_type": "record"
          }
        },
        callback: function () {
          UICustomizerEvent('SettingsDialog', 'close');
          Engine.openInformationPopup('Ваш отзыв успешно отправлен в группу "SBIS UI-Customizer"');
        }
      });
    });
  }

  function _ReportError(msg) {
    Engine.waitRequire(function (require) {
      require(['Core/helpers/generate-helpers'], function (gh) {
        var guid = gh.createGUID();
        var ver = Engine.getVerInfo();
        msg = 'Ошибка: SBIS UI-Customizer ' + ver.version + '\nСборка от: ' +
          ver.date + '\n\nСообщение:\n' + msg + '\n\n--- Настройки плагина ---\n' +
          JSON.stringify(Engine.getSettings(true)) +
          '\n------------------------';
        Engine.rpc.sbis({
          method: 'Персона.СОтправить',
          params: {
            "Получатели": [AuthorUUID],
            "Текст": msg,
            "Диалог": guid,
            "Документ": null,
            "Сообщение": null,
            "Файлы": [],
            "Опции": {
              "d": [
                false,
                false,
                false
              ],
              "s": [
                { "t": "Логическое", "n": "МассовоеСообщение" },
                { "t": "Логическое", "n": "СлитьСПредыдущим" },
                { "t": "Логическое", "n": "ВсемУчастникамТемы" }
              ],
              "_type": "record"
            }
          },
          callback: function () {
            UICustomizerEvent('SettingsDialog', 'close');
            Engine.openInformationPopup('Ваше сообщение успешно отправлено автору плагина');
          }
        });
      });
    });
  }

  function _JoinToGroup(callback) {
    Engine.rpc.sbis({
      method: 'Subscription.Create',
      params: {
        'Filter': {
          'd': [
            false,
            GroupUUID,
            false
          ],
          's': [
            { 'n': 'Admin', 't': 'Логическое' },
            { 'n': 'Channel', 't': 'Строка' },
            { 'n': 'Obligatory', 't': 'Логическое' }
          ]
        }
      },
      callback: callback
    });
  }
});
