"use strict";
(function() {
  window.addEventListener('load', initializePage);
  let sectionIndex = 0;

  /** Set up event listeners on load. */
  function initializePage() {
    document.getElementById("search-btn").addEventListener("click", search);
    window.addEventListener('keydown', handleKey);
    window.addEventListener('mousewheel', handleScroll);
    window.addEventListener('DOMMouseScroll', handleScroll);
    listenToNav();
  }

  function handleKey(event) {
    let sections = document.querySelectorAll("section:not(.hidden)");
    // console.log(sectionIndex, sections.length, sectionIndex < sections.length);

    if (event.code === "ArrowUp") {
      // console.log("move up");
      event.preventDefault();
      scrollPrevious(sections);
    } else if (event.code === "ArrowDown") {
      // console.log("move down");
      event.preventDefault();
      scrollNext(sections);
    }
  }

  function listenToNav() {
    let nav = document.querySelectorAll("a");
    nav.forEach((tab) => {
      tab.addEventListener('click', handleTab);
    })
  }

  function handleTab(event) {
    event.preventDefault();
    let sections = document.querySelectorAll("section:not(.hidden)");
    if (this.innerHTML === "List") {
      sectionIndex = sections.length - 1;
      // console.log(sectionIndex);
    } else if (this.innerHTML === "Home") {
      sectionIndex = 0;
      // console.log(sectionIndex);
    }
    performScroll(sections);
  }

  function search() {
    let search = document.getElementById("search");
    let results = document.getElementById("results");
    results.classList.toggle("hidden");

    let sections = document.querySelectorAll("section:not(.hidden)");
    scrollNext(sections);
  }

  function lookWord() {
    
  }

  function scrollNext(sections){
    if (sectionIndex < sections.length - 1) {
      sectionIndex += 1;
    }
    performScroll(sections);
  }

  function scrollPrevious(sections){
    if (sectionIndex > 0) {
      sectionIndex -= 1;
    }
    performScroll(sections);
  }

  function performScroll(sections) {
    window.scroll({
      top: sections[sectionIndex].offsetTop,
      left: 0,
      behavior: 'smooth'
    });
  }

  function handleScroll(event) {
    let sections = document.querySelectorAll("section:not(.hidden)");
    // console.log(sectionIndex, sections.length, sectionIndex < sections.length);

    if (event.wheelDelta > 0 || event.detail < 0) {
      // console.log("move up");
      scrollPrevious(sections);
    } else {
      // console.log("move down");
      scrollNext(sections);
    }
  }
})();
