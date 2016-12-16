/* jshint -W033 */
(() => {
   return {
      "HomePage": {
         "title": "Главная страница",
         "view": "section",
         "options": {
            "HideAccordion": {
               "title": "Скрыть пункты аккордеона",
               "view": "group",
               "module": "AccordionHideItems",
               "options": {
                  "Main": {
                     "title": "Основные",
                     "view": "block",
                     "options": {
                        "Documents": {
                           "title": "Документы",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Staff": {
                           "title": "Сотрудники",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Tasks": {
                           "title": "Задачи",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Contacts": {
                           "title": "Контакты",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Calendar": {
                           "title": "Календарь",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "MyPage": {
                           "title": "Моя страница",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        }
                     }
                  },
                  "Other": {
                     "title": "Прочие",
                     "view": "block",
                     "options": {
                        "Company": {
                           "title": "Компании",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Business": {
                           "title": "Бизнес",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Accounting": {
                           "title": "Учет",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "UTS": {
                           "title": "УЦ",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Telephony": {
                           "title": "Телефония",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Retail": {
                           "title": "Магазин",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Presto": {
                           "title": "Presto",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        }
                     }
                  }
               }
            },
            "HideOther": {
               "title": "Скрыть прочие блоки",
               "view": "group",
               "module": "OtherBlocksHide",
               "options": {
                  "Banners": {
                     "title": "Баннеры",
                     "view": "block",
                     "options": {
                        "Owl": {
                           "title": "Сова > Как просто",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "AsJust": {
                           "title": "\"Как просто\" над лентой",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "SideRight": {
                           "title": "Правый баннер",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        }
                     }
                  },
                  "Notice": {
                     "title": "Уведомления",
                     "view": "block",
                     "module": "HideNotice",
                     "options": {
                        "SBISPlugin": {
                           "title": "Об отсутствии СБИС Плагина",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        }
                     }
                  }
               }
            },
            "Modify": {
               "title": "Изменить внешний вид",
               "view": "group",
               "module": "HomePageModify",
               "options": {
                  "News": {
                     "title": "Новости",
                     "view": "block",
                     "options": {
                        "SmallImg": {
                           "title": "Уменьшить фото новости",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "HideAuthor": {
                           "title": "Скрыть автора из списка",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "HideFooterBtn": {
                           "title": "Скрыть оценки и репосты",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "SlimBorder": {
                           "title": "Тонкие границы новости",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "HideAttachments": {
                           "title": "Скрыть вложения под спойлер",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        }
                     }
                  },
                  "Other": {
                     "title": "Прочее",
                     "view": "block",
                     "options": {
                        "StretchPage": {
                           "title": "Растянуть сайт на всю страницу",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "HideTapeEvents": {
                           "title": "Скрыть ленту событий",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        }
                     }
                  }
               }
            }
         }
      },
      "CardTask": {
         "title": "Карточка задачи и ошибки",
         "view": "section",
         "options": {
            "TaskToolbarBtns": {
               "title": "Кнопки в шапке",
               "view": "group",
               "module": "TaskToolbarBtns",
               "options": {
                  "Show": {
                     "title": "Показать",
                     "view": "block",
                     "options": {
                        "Schedule": {
                           "title": "Время по документу",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Monitoring": {
                           "title": "Поставить на контроль",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Agreement": {
                           "title": "Отправить на согласование",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        }
                     }
                  },
                  "Hide": {
                     "title": "Скрыть",
                     "view": "block",
                     "options": {
                        "Print": {
                           "title": "Распечатать",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Save": {
                           "title": "Скачать",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        }
                     }
                  },
                  "Add": {
                     "title": "Добавить",
                     "view": "block",
                     "options": {
                        "BranchName": {
                           "title": "Имя ветки",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "СommitMsg": {
                           "title": "Комментарий для коммита",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "TaskURL": {
                           "title": "Ссылка на задачу",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        }
                     }
                  }
               }
            }
         }
      },
      "CardMR": {
         "title": "Карточка MR",
         "view": "section",
         "options": {
            "MRToolbarBtns": {
               "title": "Кнопки в шапке",
               "view": "group",
               "module": "MRToolbarBtns",
               "options": {
                  "Show": {
                     "title": "Показать",
                     "view": "block",
                     "options": {
                        "Schedule": {
                           "title": "Время по документу",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Monitoring": {
                           "title": "Поставить на контроль",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Agreement": {
                           "title": "Отправить на согласование",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        }
                     }
                  },
                  "Hide": {
                     "title": "Скрыть",
                     "view": "block",
                     "options": {
                        "Print": {
                           "title": "Распечатать",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Save": {
                           "title": "Скачать",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        }
                     }
                  },
                  "Add": {
                     "title": "Добавить",
                     "view": "block",
                     "options": {
                        "TaskURL": {
                           "title": "Ссылка на MR",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        }
                     }
                  }
               }
            }
         }
      },
      "CardErrand": {
         "title": "Карточка поручения и пр.",
         "view": "section",
         "options": {
            "ErrandToolbarBtns": {
               "title": "Кнопки в шапке",
               "view": "group",
               "module": "ErrandToolbarBtns",
               "options": {
                  "Show": {
                     "title": "Показать",
                     "view": "block",
                     "options": {
                        "Schedule": {
                           "title": "Время по документу",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Monitoring": {
                           "title": "Поставить на контроль",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Agreement": {
                           "title": "Отправить на согласование",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        }
                     }
                  },
                  "Hide": {
                     "title": "Скрыть",
                     "view": "block",
                     "options": {
                        "Print": {
                           "title": "Распечатать",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        },
                        "Save": {
                           "title": "Скачать",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        }
                     }
                  },
                  "Add": {
                     "title": "Добавить",
                     "view": "block",
                     "options": {
                        "TaskURL": {
                           "title": "Ссылка на задание",
                           "view": "option",
                           "type": "boolean",
                           "value": false
                        }
                     }
                  }
               }
            }
         }
      }
   }
}
)()