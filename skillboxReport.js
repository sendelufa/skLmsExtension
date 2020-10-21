// ==UserScript==
// @name SkillBoxLessonUrlAndReportRowCopy
// @description input for copy url
// @author sendel (telegram @sendel)
// @require  https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @version 0.40
// @include https://go.skillbox.ru/*
// @grant    GM_addStyle
// ==/UserScript==

// wrap the script in a closure (opera, ie)
// do not spoil the global scope

var GREETING_TITLE = "Здравствуйте!";
var GREETING_FOOTER = "С уважением, Константин";
var FLOAT_EDITOR_PANEL = false; //  true - панель форматирования текста будет фиксированная

const button_css = {'color': '#fff',
      'margin': '0 10px',
      'display': 'inline-block',
      'min-width':'20px',
      'border':'1px solid',
      'cursor': 'pointer',
      'padding': '8px 20px'
    };

var APPEND_ROWREPORT_ELEMENT = 'app-comment-form';

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
      $('.ui-skb-button--view-1.ng-star-inserted').trigger('click');
    }, 1000);
    //Клик на ПРИНЯТЬ
    setTimeout(function () {
      $('.ui-skb-button--view-3.ng-star-inserted').trigger('click');
    }, 3000);
  }

  function rejectHomework() {
    //Клик на ОТПРАВИТЬ
    setTimeout(function () {
      $('.ui-skb-button--view-1.ng-star-inserted').trigger('click');
    }, 1000);

     //Клик на ОТКЛОНИТЬ
    setTimeout(function () {
      $('.ui-skb-button--view-2.ng-star-inserted').trigger('click');
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

    //Обработка кликов на кнопки зачет/незачет
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

    containerMain.appendTo($(APPEND_ROWREPORT_ELEMENT));

    //ADD GREETINGS
    //wait for iframe with text editor
    setTimeout(function poll() {
      const iframe = document.querySelector('.fr-iframe');
      const doc = iframe && iframe.contentDocument;
      const textAreaEditor = doc && doc.querySelector('body');
      
      if (!textAreaEditor) { 
        setTimeout(poll, 500);
        return;
      }
      
      //change style to buttons ПРИНЯТЬ/ОТКЛОНИТЬ
       addGlobalStyle(".ui-skb-button--view-2 {background-color: #f66a6a;} .ui-skb-button--view-3.ng-star-inserted{background-color: #7ef9a3;}");
     
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

    if (student) {
      let gitlabUrl = "https://gitlab.skillbox.ru/search?group_id=&project_id=&repository_ref=&scope=users&search=" + student.replace(" ", "+");
      let gitlabLink = $('<a>', {
        text: 'Gitlab search',
        class: 'info__status skb-p3',
        href: gitlabUrl,
        target: '_blank'
      });

      gitlabLink.appendTo(document.getElementsByClassName("student__info")[0]);
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
    $('<p>', {text: GREETING_TITLE}).appendTo(textAreaEditor);
    $('<br>').appendTo(textAreaEditor);
    $('<br>').appendTo(textAreaEditor);
    $('<p>', {text: GREETING_FOOTER}).appendTo(textAreaEditor);
  }

})(window);
