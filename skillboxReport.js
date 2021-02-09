// ==UserScript==
// @name SkillBoxLessonUrlAndReportRowCopy
// @description input for copy url
// @author sendel (telegram @sendel)
// @require  https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @version 0.44-02.09.2021
// @include https://go.skillbox.ru/*
// @grant    GM_addStyle
// ==/UserScript==

// wrap the script in a closure (opera, ie)
// do not spoil the global scope

var GREETING_TITLE = "Здравствуйте!";
var GREETING_FOOTER = "С уважением, Константин";
var FLOAT_EDITOR_PANEL = false; //  true - панель форматирования текста будет фиксированная

const button_css = 
      {'color': '#fff',
       'margin': '0 10px',
       'display': 'inline-block',
       'min-width':'20px',
       'border':'1px solid',
       'cursor': 'pointer',
       'padding': '8px 20px'
      };

// css for unsticky user panel
const user_panel_remove_sticky_and_paddings = 
      {'display':'flex',
       'flex-direction':'row-reverse',
       'justify-content': 'flex-end'};

const sendel_row = {'margin': '10px 30px'};

var APPEND_ROWREPORT_ELEMENT = 'app-comment-form';

const SELECTOR_APPROVE_BUTTON = '.form__action.comments-teacher__button.ui-sb-button--small.ui-sb-button--default.ui-sb-button--view-1.success.ng-star-inserted'; // принять
const SELECTOR_REJECT_BUTTON = '.form__action.comments-teacher__button.ui-sb-button--small.ui-sb-button--default.ui-sb-button--view-1.danger.ng-star-inserted'; // отклонить

(function (window, undefined) {
  // normalized window
  var w = unsafeWindow != "undefined" ? unsafeWindow : window;

  // do not run in frames
  if (w.self != w.top) {
    return;
  }
  
  // additional url check.
  // Google Chrome do not treat @match as intended sometimes.
  if (/https:\/\/go.skillbox.ru\/homeworks\//.test(w.location.href)) {
    $(document).ready(function () {
      waitForKeyElements(SELECTOR_APPROVE_BUTTON, generateReportRow);
    });
  }

  function generateResultAndCopyToBuffer(student, module, result, course) {
    const reportElement = $('#report');
    reportElement.val(todayDate() + "\t" + student + "\t" + module + "\t" + result + "\t"
        + window.location.href + "\t" + course)
    reportElement.select();
    document.execCommand("copy");
  }

  function approveHomework() {
    clickOnElement(SELECTOR_APPROVE_BUTTON, 500);
  }

  function rejectHomework() {
    clickOnElement(SELECTOR_REJECT_BUTTON, 500);
  }
  
  function clickOnElement(selector, timeout){
        setTimeout(function () {
      $(selector).trigger('click');
    }, timeout);
  }

  function generateReportRow() {

    var module_full = $(".homework-subheader__theme-title")[0].innerText;
    var module = module_full.split(":")[0].replace("Тема ", "");
    var student = $(".info__fullname")[0].innerText;
    var course = $(".homework-course-info__name")[0].innerText;
    
    var reportRow = todayDate() + "\t" + student + "\t" + module + "\t \t" + window.location.href + "\t" + course;

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
    
    containerMain.css(sendel_row);
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
    
         //remove sticky user panel
      $(".lesson-header-wrapper").css(user_panel_remove_sticky_and_paddings);
      $(".lesson-header-wrapper").css('padding', '5px');
      $(".homework-subheader__theme-title").css(user_panel_remove_sticky_and_paddings);
      $(".homework-course-info").css(user_panel_remove_sticky_and_paddings);
      $(".skb-froala-teacher-page-offset-toolbar").css('position', 'relative');
      $(".fr-toolbar").css('background', '#FF0000');
      $(".fr-toolbar").css('top', '0');
      $(".homework-subheader").css('padding', '0px 15px 0px 50px');
    

  }

  function todayDate() {
    const d = new Date();
    return String(d.getDate()).padStart(2, '0') + "." + String(
        (d.getMonth() + 1)).padStart(2, '0') + "." + d.getFullYear();
  }

  function appendGreetingTo(textAreaEditor) {
    $('<p>', {text: GREETING_TITLE}).appendTo(textAreaEditor);
    $('<br>').appendTo(textAreaEditor);
    $('<br>').appendTo(textAreaEditor);
    $('<p>', {text: GREETING_FOOTER}).appendTo(textAreaEditor);
  }

})(window);
