// ==UserScript==
// @name SkillBoxPumpItLMS
// @description make LMS better
// @author sendel (telegram @sendel)
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @require https://gist.github.com/raw/2625891/waitForKeyElements.js
// @version 24.06.2021
// @include https://go.skillbox.ru/*
// @grant    GM_addStyle
// ==/UserScript==

const GREETING_TITLE_WITHOUT_NAME = "Добрый день!";
const GREETING_TITLE_WITH_NAME = "Добрый день, ";
const GREETING_FOOTER = "Успехов! 🖖";

const FLOAT_EDITOR_PANEL = false; 							//  true - панель форматирования текста будет фиксированная
const INSERT_CYRILLYC_NAME_IN_GREETING = true; 	// если установлено true, то к GREETING_TITLE добавится имя и !
const COMPACT_HEADER = true; 										// если true - заголовок работы будет компактен
const HIDE_EMPTY_COURSES = false; 								// если true - курсы без домашних заданий будут скрыты в общем списке

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

const SELECTOR_APPROVE_BUTTON = '.comments-teacher__button.ui-sb-button--small.ui-sb-button--default.ui-sb-button--view-1.success'; // принять
const SELECTOR_REJECT_BUTTON = '.comments-teacher__button.ui-sb-button--small.ui-sb-button--default.ui-sb-button--view-1.danger'; // отклонить

const HOMEWORK_PANELS_LIST = '.homeworks-panel-accordion'; // панельки курса на проверку

document.addEventListener('DOMContentLoaded', function () {
  // normalized window
  var w = unsafeWindow != "undefined" ? unsafeWindow : window;

  // do not run in frames
  if (w.self != w.top) {
    return;
  }

  // additional url check.
  // Google Chrome do not treat @match as intended sometimes.
  if (/https:\/\/go.skillbox.ru\/homeworks/.test(w.location.href)) {
    $(document).ready(function () {
      waitForKeyElements(SELECTOR_APPROVE_BUTTON, generateReportRow);

      if(HIDE_EMPTY_COURSES){
        waitForKeyElements(HOMEWORK_PANELS_LIST, hideCoursesWithZeroHomeworks);
      }
    });
  }

  function hideCoursesWithZeroHomeworks(item) {
    let statusToCheck = $(item).find('.description__wait').text();
    if (statusToCheck == 'На проверку: 0'){
      $(item).hide();
    }
  }

  function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
  }

  addGlobalStyle(".over {   background-color: black;\
  animation-name: greenblink;\
  animation-duration: 0.5s;\
  border: 0px;}\
  @keyframes greenblink {\
   0%  {background-color: black;}\
  25%  {background-color: #7CFC00;}\
  50%  {background-color: black;}}");

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

    var module_full = $(".homework-subheader__theme-title")[0].innerText.split(".")[0];
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
      const iframe = document.querySelector('app-comment-form .fr-iframe');
      const doc = iframe && iframe.contentDocument;
      const textAreaEditor = doc && doc.querySelector('body');

      if (!textAreaEditor) {
        setTimeout(poll, 500);
        return;
      }

      if (textAreaEditor.innerHTML.length < 21) {
        appendGreetingTo(textAreaEditor, student);
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
    if(COMPACT_HEADER) {
      $(".lesson-header-wrapper").css(user_panel_remove_sticky_and_paddings);
      $(".lesson-header-wrapper").css('padding', '5px');
      $(".homework-subheader__theme-title").css(user_panel_remove_sticky_and_paddings);
      $(".homework-course-info").css(user_panel_remove_sticky_and_paddings);
      $(".skb-froala-teacher-page-offset-toolbar").css('position', 'relative');
      $(".homework-subheader").css('padding', '0px 10px 0px 50px');
    }


    setTimeout(() => {
      // fix toolbar at the top
      let toolbar = $(".custom-theme.fr-toolbar.fr-top");
      toolbar.css('top', '0');
      toolbar.css('z-index', '300');
      toolbar.css('background', '#F9F9F9');
      toolbar.css('border-width', '1px 0px 0px');
      toolbar.css('border-color', '#b3b3b3');
      toolbar.css('height', '80px');
      addCopyTokenButton();
    }, 2000);
  }

  function addCopyTokenButton(){
    let btnCopy = $('<button>', {
      text: '🔑',
      class: 'ui-sb-button--default-circle ui-sb-button--view-circle-1 homework-course-info__button sendel-ct',
      uisbtooltip: 'Скопировать токен для бота статистики',
      '_ngcontent-nta-c316':'',
    });
    btnCopy.css("border-radius", "10px");
    btnCopy.css("cursor", "pointer");
    btnCopy.css("width", "40px");
    btnCopy.css("height", "40px");

    btnCopy.click(copyRefreshTokenToClipboard);
    btnCopy.appendTo(document.getElementsByClassName("homework-course-info__buttons")[0]);

    $(".ui-sb-button--view-circle-1").css("margin", "2px");

    btnCopy.click(function() {
      $(this).addClass('over');
    });
    btnCopy.mouseleave(function() {
      $(this).removeClass('over');
    });

  }

  function copyRefreshTokenToClipboard(){
    const el = document.createElement('textarea');
    el.value =  localStorage.getItem("x-refresh-token");
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    $(".homework-course-info__buttons").animate({color: 'red'});
  }

  function todayDate() {
    const d = new Date();
    return String(d.getDate()).padStart(2, '0') + "." + String(
        (d.getMonth() + 1)).padStart(2, '0') + "." + d.getFullYear();
  }

  function appendGreetingTo(textAreaEditor, studentName) {
    var title = GREETING_TITLE_WITHOUT_NAME;
    if (INSERT_CYRILLYC_NAME_IN_GREETING && /[А-Я][а-я]+\s[А-Я][а-я]+/u.test(studentName)){
      title = GREETING_TITLE_WITH_NAME + studentName.split(" ")[0] + '!';
    }

    // remove blank line in the textArea
    textAreaEditor.insertAdjacentHTML('afterbegin', '<p>' + title + '</p>');

    $('<br>').appendTo(textAreaEditor);
    $('<br>').appendTo(textAreaEditor);
    $('<p>', {text: GREETING_FOOTER}).appendTo(textAreaEditor);
  }

});
