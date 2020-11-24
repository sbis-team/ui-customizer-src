UICustomizerDefine('ChristmasStyle', ['Engine'], function (Engine) {
  'use strict';

  var images = {
    /* Иконки меню */
    'christmas-card': Engine.getPNG('christmas-card-24'),
    'christmas-sock': Engine.getPNG('christmas-sock-24'),
    'gingerbread-man': Engine.getPNG('gingerbread-man-24'),
    'christmas-card2': Engine.getPNG('christmas-card2-24'),
    'christmas-card3': Engine.getPNG('christmas-card3-24'),
    'christmas-day': Engine.getPNG('christmas-day-24'),
    'cabin': Engine.getPNG('cabin-24'),
    'christmas-ball': Engine.getPNG('christmas-ball-24'),
    'snow-globe': Engine.getPNG('snow-globe-24'),
    'light': Engine.getPNG('light-24'),
    'mitten': Engine.getPNG('mitten-24'),
    'shopping-bag': Engine.getPNG('shopping-bag-24'),
    'sale': Engine.getPNG('sale-24'),
    'mug': Engine.getPNG('mug-24'),
    'reindeer': Engine.getPNG('reindeer-24'),
    'champagne': Engine.getPNG('champagne-24'),
    'gift': Engine.getPNG('gift-24'),
    'gift2': Engine.getPNG('gift2-24'),
    'mittens': Engine.getPNG('mittens-24'),
    'sleigh': Engine.getPNG('sleigh-24'),
    'elf': Engine.getPNG('elf-24'),
    'candy-cane': Engine.getPNG('candy-cane-24'),
    'cane': Engine.getPNG('cane-24'),
    'card': Engine.getPNG('card-24'),
    'santa-claus': Engine.getPNG('santa-claus-24'),
    'shopping-bag2': Engine.getPNG('shopping-bag2-24'),
    'gift3': Engine.getPNG('gift3-24'),
    /* Прочие картинки */
    'tree': Engine.getPNG('tree-16'),
    'santa-hat': Engine.getPNG('santa-hat-24'),
    'logo_penguin': Engine.getPNG('logo_penguin'),
    'owl': Engine.getPNG('owl-64'),
    'christmas-tree-big': Engine.getPNG('christmas-tree-big'),
  };
  var imagesColor = {
    'christmas-card': Engine.getPNG('christmas-card-24-color'),
    'christmas-sock': Engine.getPNG('christmas-sock-24-color'),
    'gingerbread-man': Engine.getPNG('gingerbread-man-24-color'),
    'christmas-card2': Engine.getPNG('christmas-card2-24-color'),
    'christmas-card3': Engine.getPNG('christmas-card3-24-color'),
    'christmas-day': Engine.getPNG('christmas-day-24-color'),
    'cabin': Engine.getPNG('cabin-24-color'),
    'christmas-ball': Engine.getPNG('christmas-ball-24-color'),
    'snow-globe': Engine.getPNG('snow-globe-24-color'),
    'light': Engine.getPNG('light-24-color'),
    'mitten': Engine.getPNG('mitten-24-color'),
    'shopping-bag': Engine.getPNG('shopping-bag-24-color'),
    'sale': Engine.getPNG('sale-24-color'),
    'mug': Engine.getPNG('mug-24-color'),
    'reindeer': Engine.getPNG('reindeer-24-color'),
    'champagne': Engine.getPNG('champagne-24-color'),
    'gift': Engine.getPNG('gift-24-color'),
    'gift2': Engine.getPNG('gift2-24-color'),
    'mittens': Engine.getPNG('mittens-24-color'),
    'sleigh': Engine.getPNG('sleigh-24-color'),
    'elf': Engine.getPNG('elf-24-color'),
    'candy-cane': Engine.getPNG('candy-cane-24-color'),
    'cane': Engine.getPNG('cane-24-color'),
    'card': Engine.getPNG('card-24-color'),
    'santa-claus': Engine.getPNG('santa-claus-24-color'),
    'shopping-bag2': Engine.getPNG('shopping-bag2-24-color'),
    'gift3': Engine.getPNG('gift3-24-color'),
  };
  var colorTheme = {
    'MenuIconsColor': 'MenuIcons'
  };

  return {
    applySettings: applySettings
  };

  function applySettings(settings) {
    var css = '';
    for (let groupName in settings.options) {
      let group = settings.options[groupName];
      for (let name in group.options) {
        let color = name in colorTheme;
        let cssname = 'ChristmasStyle-' + groupName + '-' + (color ? colorTheme[name] : name);
        if (group.options[name].value && Engine.hasCSS(cssname)) {
          css += Engine.getCSS(cssname, color ? imagesColor : images);
        }
      }
    }

    if (css) {
      Engine.appendCSS('ChristmasStyle', css);
    } else {
      Engine.removeCSS('ChristmasStyle');
    }

  }

});
