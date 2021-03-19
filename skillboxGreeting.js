// ==UserScript==
// @name SkillBoxLessonPureGreetings
// @description just nice greetings
// @author aguseva (telegram @aguseva)
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @version 0.1-19.03.2021
// @include https://go.skillbox.ru/*
// ==/UserScript==

// wrap the script in a closure (opera, ie)
// do not spoil the global scope

var GREETING_TITLE = "Добрый день, ";
var GREETING_FOOTER = "С уважением, Ваш преподаватель";  // вписать свой текст


(function (window, undefined) {

    //wait for iframe with text editor
    setTimeout(function poll() {
      const iframe = document.querySelector('.fr-iframe');
      const doc = iframe && iframe.contentDocument;
      const textAreaEditor = doc && doc.querySelector('body');

      if (!textAreaEditor) {
        setTimeout(poll, 1);
        return;
      }

    if (textAreaEditor.innerHTML.length < 21) {
        appendGreetingTo(textAreaEditor);
     }
    });

  function appendGreetingTo(textAreaEditor) {
      var student = $(".info__fullname")[0].innerText;
      var student_name = student.split(' ')[0].trim();
      textAreaEditor.insertAdjacentHTML('afterbegin', '<p>' + GREETING_TITLE + student_name + '!</p>');
      $('<p>', {text: GREETING_FOOTER}).appendTo(textAreaEditor);
  }

})(window);
