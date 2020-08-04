// ==UserScript==
// @name SkillBoxLessonUrlAndReportRowCopy v0.31
// @description input for copy url
// @author sendel (telegram @sendel)
// @require  https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @version 0.31
// @include https://go.skillbox.ru/*
// @grant    GM_addStyle
// ==/UserScript==

// wrap the script in a closure (opera, ie)
// do not spoil the global scope

var GREETING_TITLE = "Здравствуйте!";
var GREETING_FOOTER = "С уважением, Константин";
var FLOAT_EDITOR_PANEL = false; //  true - панель форматирования текста будет фиксированная
var HOMEWORK_BUTTON_TEXT_HIDE = true; // true - кнопки скрыть показать текст домашнего задания
var HOMEWORK_TEXT_HIDE = true; // true - по умолчанию текст дз на странице проверки работ будет скрыть (работает если HOMEWORK_BUTTON_TEXT_HIDE = true)


(function (window, undefined) {

  // normalized window
  var w;
  if (unsafeWindow != "undefined") {
    w = unsafeWindow
  } else {
    w = window;
  }

  // do not run in frames
  if (w.self != w.top) {
    return;
  }



  var reportRow = '';

  //generate report string, split with tab
  function generateReportRow(content) {

    if (HOMEWORK_BUTTON_TEXT_HIDE && HOMEWORK_TEXT_HIDE) {
      $(".course_text").css("display", "none");
    }

    var elements = $(content).find("span");
    var module_full = elements[1].innerHTML;
    var module = module_full.split(':')[0].trim();
    var student = elements[2].innerHTML.split(':')[1].trim();
    var course = elements[0].innerHTML.split(':')[0].trim();
    let result = '';

    reportRow = todayDate() + "\t" + student + "\t" + module + "\t \t" + window.location.href + "\t" + course;

    let articles = $('.comments__add');

    //create new HTML elements
    let containerMain = $('<div>', {
      id: 'sendel-container-main'
    });
    let containerRowReport = $('<div>', {
      id: 'sendel-copy-row'
    });
    let containerCopyUrl = $('<div>', {
      id: 'sendel-p-copy-url'
    });
    let done = $('<button>', {
      text: 'зачет'
    });
    let rework = $('<button>', {
      text: 'незачет'
    });

    done.appendTo(containerRowReport)
    rework.appendTo(containerRowReport)
    done.css({
      'backgroundColor': 'green',
      'color': '#fff',
      'margin': '10px 10px 0 0'
    });
    rework.css({
      'backgroundColor': 'red',
      'color': '#fff'
    });

    let inputCopyUrl = $('<input>', {
      type: 'text',
      value: window.location.href,
      name: 'sendel-copy-url',
      click: function () {
        this.select();
        document.execCommand("copy");
        $('#sendel-p-copy-url').append('  ссылка скопирована!');
      }
    });
    inputCopyUrl.css("width", "100%");


    let inputCopyRowToReport = $('<input>', {
      type: 'text',
      value: reportRow,
      name: 'sendel-copy-row',
      click: function () {
        this.select();
        document.execCommand("copy");
        $('#sendel-copy-row').append('  строка для отчета скопирована!');
      }
    });
    inputCopyRowToReport.css("width", "100%");

    //Обработка кликов на кнопки зачет/незачет
    done.click(function () {
      result = 'зачет'
      $('#report').val(reportRow + result)
      $('#report').select();
      document.execCommand("copy");

      //Клик на ОТПРАВИТЬ
      setTimeout(function () {
        $('.skillbox-btn.ng-star-inserted').trigger('click');
      }, 1000);
      //Клик на ПРИНЯТЬ
      setTimeout(function () {
        $('.skillbox-btn.skillbox-btn_success').trigger('click');
      }, 3000);
    });
    rework.click(function () {
      result = 'незачет'
      $('#report').val(reportRow + result)
      $('#report').select();
      document.execCommand("copy");
      //Клик на ОТПРАВИТЬ
      setTimeout(function () {
        $('.skillbox-btn.ng-star-inserted').trigger('click');
      }, 1000);
      //Клик на ОТКЛОНИТЬ
      setTimeout(function () {
        $('.skillbox-btn.skillbox-btn_danger').trigger('click');
      }, 3000);
    });


    //appends to containers
    $('<span>', {
      text: 'Строка для отчета: '
    }).appendTo(containerRowReport);
    inputCopyRowToReport.appendTo(containerRowReport);

    $('<span>', {
      text: 'Ссылка на дз: '
    }).appendTo(containerCopyUrl);
    inputCopyUrl.appendTo(containerCopyUrl);


    $('<hr>').appendTo(containerMain);
    containerCopyUrl.appendTo(containerMain);
    containerRowReport.appendTo(containerMain);

    containerMain.appendTo($('.comments__add'));

    //add template answer if text is empty
    if ($(".fr-element p").length < 2) {
      let templateHello = $('<p>', {
        text: GREETING_TITLE
      });
      let templateContent = $('<p>', {
        text: " "
      });
      $('<br>').appendTo(templateContent);
      let templateBye = $('<p>', {
        text: GREETING_FOOTER
      });
      let answerArea = $(".fr-element");

      $(".fr-element p").remove()

      templateHello.appendTo(answerArea);
      templateContent.appendTo(answerArea);
      templateBye.appendTo(answerArea);

      //show float panel for editor
      if (FLOAT_EDITOR_PANEL) {
        let editor_panel = $(".fr-toolbar");
        editor_panel.css("position", "fixed");
        editor_panel.css("top", "64px");
        editor_panel.css("z-index", "500");
        editor_panel.css("border", "2px");
        editor_panel.css("boder-color", "#979797");
        editor_panel.css("border-style", "solid");
      }

      if (HOMEWORK_BUTTON_TEXT_HIDE) {

        let btn_hw_toggle_t = $('<button>', {
          class: 'sendel-btn-hw-toggle skillbox-btn btn-outline-primary',
          text: 'Скрыть-показать текст дз / ' + module_full + ' / ' + course
        });
        let btn_hw_toggle_f = $('<button>', {
          class: 'sendel-btn-hw-toggle skillbox-btn btn-outline-primary',
          text: 'Скрыть-показать текст дз'
        });

        btn_hw_toggle_t.css("margin", "5px");
        btn_hw_toggle_t.css("margin", "5px");

        btn_hw_toggle_t.prependTo($(".work__content"));
        btn_hw_toggle_f.appendTo($(".course_text"));

        $(".sendel-btn-hw-toggle").click(function () {
          $(".course_text").toggle();
        });
      }


    }
  }

  // additional url check.
  // Google Chrome do not treat @match as intended sometimes.
  if (/https:\/\/go.skillbox.ru\/homeworks\//.test(w.location.href)) {
    $(document).ready(function () {
      waitForKeyElements(".work__content", generateReportRow);

    });

  }

  function todayDate() {
    var d = new Date();
    return String(d.getDate()).padStart(2, '0') + "." + String((d.getMonth() + 1)).padStart(2, '0') + "." + d.getFullYear();
  }

  function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) {
      return;
    }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
  }

})(window);