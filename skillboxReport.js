// ==UserScript==
// @name SkillBoxLessonUrlAndReportRowCopy 0.37
// @description input for copy url
// @author sendel (telegram @sendel)
// @require  https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @version 0.37
// @include https://go.skillbox.ru/*
// @grant    GM_addStyle
// ==/UserScript==

// wrap the script in a closure (opera, ie)
// do not spoil the global scope

var GREETING_TITLE = "Здравствуйте!";
var GREETING_FOOTER = "С уважением, ";
var FLOAT_EDITOR_PANEL = true; //  true - панель форматирования текста будет фиксированная

const button_css = {'color': '#fff',
      'margin': '0 10px 10px 0',
      'display': 'inline-block',
      'min-width':'20px',
      'height':'25px'
    };

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

  function generateResultAndCopyToBuffer(student, module, result, course) {
    const reportElement = $('#report');
    reportElement.val(
        todayDate() + "\t" + student + "\t" + module + "\t" + result + "\t"
        + window.location.href + "\t" + course)
    reportElement.select();
    document.execCommand("copy");
  }

  function approveHomework() {
    //Клик на ОТПРАВИТЬ
    setTimeout(function () {
      $('.skillbox-btn.ng-star-inserted').trigger('click');
    }, 1000);
    //Клик на ПРИНЯТЬ
    setTimeout(function () {
      $('.skillbox-btn.skillbox-btn_success').trigger('click');
    }, 3000);
  }

  function rejectHomework() {
    //Клик на ОТПРАВИТЬ
    setTimeout(function () {
      $('.skillbox-btn.ng-star-inserted').trigger('click');
    }, 1000);
     //Клик на ОТКЛОНИТЬ
    setTimeout(function () {
      $('.skillbox-btn.skillbox-btn_danger').trigger('click');
    }, 3000);
  }

  function generateReportRow(content) {
    var module_full = $("app-lesson-subheader-title")[0].innerText;
    var module = module_full.split(":")[0].replace("Тема ", "");
    var student = $(".student__info span")[0].innerText;
    var course = ""; // html don't contains course name

    reportRow = todayDate() + "\t" + student + "\t" + module + "\t \t" + window.location.href + "\t" + course;

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
      text: '👍 зачет',
      class: 'skillbox-btn'
    });
    let rework = $('<button>', {
      text: '✖️ незачет',
      class: 'skillbox-btn'
    });

    done.css({'backgroundColor': '#2fa52f'});
    done.css(button_css);

    rework.css({'backgroundColor': '#f84949'});
    rework.css(button_css);

    done.appendTo(containerRowReport)
    rework.appendTo(containerRowReport)

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
    inputCopyRowToReport.css({"width": "100%", 'margin-bottom': '10px'});
    inputCopyRowToReport.attr('id', 'report')

    //Обработка кликов на кнопки зачет�/незачет
    done.click(function () {
     var result = 'зачет';
      generateResultAndCopyToBuffer(student, module, result, course)
      approveHomework();
    });

    rework.click(function () {
     var result = 'незачет';
      generateResultAndCopyToBuffer(student, module, result, course)
      rejectHomework();
    });

    //appends to containers
    $('<span>', {text: 'Строка для отчета: '})
          .css({'display': 'block'})
		  .appendTo(containerRowReport);
    inputCopyRowToReport
          .appendTo(containerRowReport);

    $('<hr>').appendTo(containerMain);
    containerCopyUrl.appendTo(containerMain);
    containerRowReport.appendTo(containerMain);

    containerMain.appendTo($('.comments__add'));

    //ADD GREETINGS
    //wait for iframe with text editor
    setTimeout(function poll() {
      const iframe = document.querySelector('.fr-iframe');
      const doc = iframe && iframe.contentDocument;
      const textAreaEditor = doc && doc.querySelector('body');
      if (!textAreaEditor) {
        setTimeout(poll, 200);
        return;
      }

      if (textAreaEditor.innerHTML.length < 21) {
        appendGreetingTo(textAreaEditor);
      }
    });

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
  }

  // additional url check.
  // Google Chrome do not treat @match as intended sometimes.
  if (/https:\/\/go.skillbox.ru\/homeworks\//.test(w.location.href)) {
    $(document).ready(function () {
      waitForKeyElements("div.student", generateReportRow);
    });
  }

  function todayDate() {
    const d = new Date();
    return String(d.getDate()).padStart(2, '0') + "." + String(
        (d.getMonth() + 1)).padStart(2, '0') + "." + d.getFullYear();
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

  function appendGreetingTo(textAreaEditor) {
    const teacher_name = $('.header__user-name')[0].innerHTML.trim().split('&nbsp;')[0].trim();
    $('<p>', {text: GREETING_TITLE}).appendTo(textAreaEditor);
    $('<br>').appendTo(textAreaEditor);
    $('<br>').appendTo(textAreaEditor);
    $('<p>', {text: GREETING_FOOTER + teacher_name}).appendTo(textAreaEditor);
    document.querySelector('.fr-iframe').contentDocument.querySelector('.fr-view').firstElementChild.remove()
  }

})(window);
