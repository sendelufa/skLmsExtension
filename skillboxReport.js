// ==UserScript==
// @name SkillBoxPumpItLMS
// @description make LMS better
// @author sendel (telegram @sendel)
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @require https://gist.github.com/raw/2625891/waitForKeyElements.js
// @version 26.01.2022
// @include https://go.skillbox.ru/*
// @grant    GM_addStyle
// ==/UserScript==

// wrap the script in a closure (opera, ie)
// do not spoil the global scope

const GREETING_TITLE_WITHOUT_NAME = "Добрый день!";
const GREETING_TITLE_WITH_NAME = "Добрый день, ";
const GREETING_FOOTER = "Успехов! 🖖";

const INSERT_CYRILLYC_NAME_IN_GREETING = true; 	// если установлено true, то к GREETING_TITLE добавится имя и !
const COMPACT_HEADER = true; 										// если true - заголовок работы будет компактен
const HIDE_EMPTY_COURSES = false; 								// если true - курсы без домашних заданий будут скрыты в общем списке
const HIDE_REPORT_ROW = true; 								// если true - строка для отчета не будет показываться

const button_css = {
  'color': '#fff', 'margin': '0 10px',
  'display': 'inline-block', 'min-width': '20px', 'border': '1px solid',
  'cursor': 'pointer', 'padding': '8px 20px'
};

const button_settings = {
  'background-color': 'cadetblue',
  'font-size': '1rem'
};

// css for unsticky user panel
const user_panel_remove_sticky_and_paddings = {
  'display': 'flex',
  'flex-direction': 'row-reverse',
  'justify-content': 'flex-end'
};

const sendel_row = { 'margin': '10px 30px' };

var APPEND_ROWREPORT_ELEMENT = 'app-comment-form';

const SELECTOR_APPROVE_BUTTON = '.comments-teacher__button.ui-sb-button--small.ui-sb-button--default.ui-sb-button--view-1.success'; // принять
const SELECTOR_REJECT_BUTTON = '.comments-teacher__button.ui-sb-button--small.ui-sb-button--default.ui-sb-button--view-1.danger'; // отклонить

const HOMEWORK_PANELS_LIST = '.homeworks-panel-accordion'; // панельки курса на проверку
const HOMEWORK_TITLE_LIST_CLASS = '.homeworks__header';
const HIDE_EMPTY_HW_CHECKBOX_CLASS = 'hide_empty_hw_checkbox';

(function (window, undefined) {
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
      waitForKeyElements(HOMEWORK_TITLE_LIST_CLASS, appendSettingsButton);
      waitForKeyElements(SELECTOR_APPROVE_BUTTON, pumpIt);

      if (HIDE_EMPTY_COURSES) {
        waitForKeyElements(HOMEWORK_PANELS_LIST, hideCoursesWithZeroHomeworks);
      }

      addGlobalStyle(".over {   background-color: black;\
  animation-name: greenblink;\
  animation-duration: 0.5s;\
  border: 0px;}\
  @keyframes greenblink {\
   0%  {background-color: black;}\
  25%  {background-color: #7CFC00;}\
  50%  {background-color: black;}}");
    });
  }

  function pumpIt() {
    if (!HIDE_REPORT_ROW) {
      generateReportRow();
    }

    addGreeting();
    compactHomeworkTitle();
    bakeHeader();
  }

  function hideCoursesWithZeroHomeworks(item) {
    let statusToCheck = $(item).find('.description__wait').text();
    if (statusToCheck == 'На проверку: 0') {
      $(item).hide();
    }
  }

  function appendSettingsButton(item) {
    let settingsButton = $('<input>', {
      class: 'sendel_input',
      type: 'checkbox',
      id: HIDE_EMPTY_HW_CHECKBOX_CLASS,
    })
      .css(button_css)
      .css(button_settings)
      .click(toggleShowEmptyCourses);

    $('<div>', { id: 'lms_settings' })
      .append(settingsButton)
      .append($('<label>', { for: HIDE_EMPTY_HW_CHECKBOX_CLASS, text: 'Показаны курсы без домашних работ' }))
      .insertAfter(item);

    item.hide();
  }

  function toggleShowEmptyCourses() {
    const checkboxShowEmptyCourses = $('#' + HIDE_EMPTY_HW_CHECKBOX_CLASS);

    if (checkboxShowEmptyCourses.is(':checked')) {
      $(HOMEWORK_PANELS_LIST).show();
    } else {
      $(HOMEWORK_PANELS_LIST).each(function () { hideCoursesWithZeroHomeworks($(this)) });
    }
  }

  function addGlobalStyle(css) {
    $('head').append($('<style>', { type: 'text/css', text: css }));
  }

  function generateResultAndCopyToBuffer(student, module, result, course) {
    $('#report')
      .val([todayDateFormatted(), student, module, result, window.location.href, course].join("\t"))
      .select();
    document.execCommand("copy");
  }

  let approveHomework = () => clickOnElement(SELECTOR_APPROVE_BUTTON, 500);
  let rejectHomework = () => clickOnElement(SELECTOR_REJECT_BUTTON, 500);

  let clickOnElement = (selector, timeout) => setTimeout(
    () => $(selector).trigger('click'), timeout);

  let getStudentName = () => $(".info__fullname")[0].innerText;

  function generateReportRow() {
    var module_full = $(".homework-subheader__theme-title")[0].innerText.split(".")[0];
    var module = module_full.split(":")[0].replace("Тема ", "");
    var student = getStudentName();
    var course = $(".homework-course-info__name")[0].innerText;

    var reportRow = todayDateFormatted() + "\t" + student + "\t" + module + "\t \t" + window.location.href + "\t" + course;

    let containerMain = $('<div>', { id: 'sendel-container-main' });
    let containerRowReport = $('<div>', { id: 'sendel-copy-row' });
    let containerCopyUrl = $('<div>', { id: 'sendel-p-copy-url' });
    let done = $('<button>', { text: '👍 зачет', class: 'skillbox-btn' })
      .css({ 'backgroundColor': '#2fa52f' })
      .css(button_css);
    let rework = $('<button>', { text: '✖️ незачет', class: 'skillbox-btn' })
      .css({ 'backgroundColor': '#f84949' })
      .css(button_css);

    done.appendTo(containerRowReport)
    rework.appendTo(containerRowReport)

    let inputCopyRowToReport = $('<input>', {
      type: 'text',
      id: 'report',
      value: reportRow,
      name: 'sendel-copy-row',
      click: function () {
        this.select();
        document.execCommand("copy");
        $('#sendel-copy-row').append('  строка для отчета скопирована!');
      }
    })
      .css({ "width": "100%", 'margin-bottom': '10px' });

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
    $('<span>', { text: 'Строка для отчета: ' })
      .css({ 'display': 'block' })
      .appendTo(containerRowReport);
    inputCopyRowToReport.appendTo(containerRowReport);

    $('<hr>').appendTo(containerMain);
    containerCopyUrl.appendTo(containerMain);
    containerRowReport.appendTo(containerMain);

    containerMain.css(sendel_row);
    containerMain.appendTo($(APPEND_ROWREPORT_ELEMENT));
  }

  function addGreeting() {
    setTimeout(function poll() {
      const textAreaEditor = document.querySelector("app-comments-teacher .fr-view");

      if (!textAreaEditor) {
        setTimeout(poll, 500);
        return;
      }

      if (textAreaEditor.innerHTML.length < 21) {
        appendGreetingTo(textAreaEditor, getStudentName());
      }
    });
  }

  function addGitlabSearchButton() {
    let student = getStudentName();
    if (student) {
      let gitlabUrl = "https://gitlab.skillbox.ru/search?group_id=&project_id=&repository_ref=&scope=users&search=" + student.replace(" ", "+");
      $('<a>', {
        text: 'Search ' + student + ' in Gitlab',
        class: 'info__status skb-p3',
        href: gitlabUrl,
        target: '_blank'
      }).appendTo($(".student__info"));
    }
  }


  function bakeHeader() {
    setTimeout(() => {
      compactHomeworkTitle();
      addCopyTokenButton();
      addGitlabSearchButton();
    }, 2000);
  }

  function compactHomeworkTitle() {
    $(".lesson-header-wrapper").css(user_panel_remove_sticky_and_paddings);
    $(".lesson-header-wrapper").css('padding', '5px');
    $(".homework-subheader__theme-title").css(user_panel_remove_sticky_and_paddings);
    $(".homework-course-info").css(user_panel_remove_sticky_and_paddings);
    $(".skb-froala-teacher-page-offset-toolbar").css('position', 'relative');
    $(".homework-subheader").css('padding', '0px 10px 0px 50px');
  }

  function addCopyTokenButton() {
    $('<button>', {
      text: '🔑',
      class: 'ui-sb-button--default-circle ui-sb-button--view-circle-1 homework-course-info__button sendel-ct',
      uisbtooltip: 'Скопировать токен для бота статистики', '_ngcontent-nta-c316': '',
    })
      .css({
        "border-radius": "10px",
        "cursor": "pointer",
        "width": "40px",
        "height": "40px",
      })
      .click(copyRefreshTokenToClipboard)
      .click(function () { $(this).addClass('over'); })
      .mouseleave(function () { $(this).removeClass('over'); })
      .appendTo($(".homework-course-info__buttons"));

    $(".ui-sb-button--view-circle-1").css("margin", "2px");
  }

  function copyRefreshTokenToClipboard() {
    const el = $('<textarea>', {
      text: localStorage.getItem("x-refresh-token")
    });

    $('body').append(el);
    el.select();
    document.execCommand('copy');
    el.remove();
  }

  function todayDateFormatted() {
    return new Date().toLocaleDateString('ru-RU');
  }

  function appendGreetingTo(textAreaEditor, studentName) {
    var title = INSERT_CYRILLYC_NAME_IN_GREETING && /[А-Я][а-я]+\s[А-Я][а-я]+/u.test(studentName) ?
      GREETING_TITLE_WITH_NAME + studentName.split(" ")[0] + '!' : GREETING_TITLE_WITHOUT_NAME;

    textAreaEditor.insertAdjacentHTML('afterbegin', '<p>' + title +
      '</p><br/><br/><p>' + GREETING_FOOTER + '</p>');
  }
})(window);
