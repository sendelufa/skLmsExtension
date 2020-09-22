// ==UserScript==
// @name SkillBoxStoreAnswer 0.01
// @description store to localstorage last test answer
// @author sendel (telegram @sendel)
// @require  https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @include https://go.skillbox.ru/*
// @grant    GM_addStyle
// ==/UserScript==

(function (window, undefined) {
  const save_text_key = "SkHelper.hw_last_text";
  const element_appendTo = ".comments__add";

  // normalized window
  var w;
  if (unsafeWindow != "undefined") {
    w = unsafeWindow;
  } else {
    w = window;
  }

  // do not run in frames
  if (w.self != w.top) {
    return;
  }

  // additional url check.
  // Google Chrome do not treat @match as intended sometimes.
  if (/https:\/\/go.skillbox.ru\/homeworks\//.test(w.location.href)) {
    $(document).ready(function () {
      waitForKeyElements(".work__content", start);
    });
  }

  function start(content) {
    addRestoreTextButton();
    addShowSavedText();
    $("button.ng-star-inserted").click(saveHomeworkTextToLocalstorage);
  }

  function addSaveTextButton() {
    let btn_hw_save_text = $("<button>", {
      class: "sendel-btn-hw-save skillbox-btn btn-outline-primary",
      text: "Cохранить текст ДЗ ",
    });

    btn_hw_save_text.click(saveHomeworkTextToLocalstorage);
    btn_hw_save_text.appendTo($(element_appendTo));
  }

  function addShowSavedText() {
    let btn_hw_show_text = $("<button>", {
      class: "sendel-btn-hw-show skillbox-btn btn-outline-primary",
      text: "👀",
    });

    btn_hw_show_text.click(showHomeworkText);
    btn_hw_show_text.appendTo($(element_appendTo));
  }

  function addRestoreTextButton() {
    let btn_hw_restore_text = $("<button>", {
      class: "sendel-btn-hw-save skillbox-btn btn-outline-primary",
      text: "Восстановить текст ДЗ ",
    });

    btn_hw_restore_text.click(restoreHomeworkTextToLocalstorage);
    btn_hw_restore_text.appendTo($(element_appendTo));
  }

  function showHomeworkText() {
    alert(localStorage.getItem(save_text_key));
  }

  function saveHomeworkTextToLocalstorage() {
    localStorage.setItem(save_text_key, getTextEditorElement().innerHTML);
  }

  function restoreHomeworkTextToLocalstorage() {
    getTextEditorElement().innerHTML = localStorage.getItem(save_text_key);
  }

  function getTextEditorElement() {
    const iframe = document.querySelector(".fr-iframe");
    const doc = iframe && iframe.contentDocument;
    const textAreaEditor = doc && doc.querySelector("body");
    if (!textAreaEditor) {
      setTimeout(saveHomeworkTextToLocalstorage, 200);
      return;
    }

    return textAreaEditor;
  }
})(window);
