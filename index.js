/*
 * Name: Andrei Karavanov
 * Date: October 31, 2019
 * Section: CSE 154 AB
 *
 * This is a .js file that manages operation of GRE Vocabulary web-app.
 */
"use strict";
(function() {
  window.addEventListener('load', initializePage);
  let sectionIndex = 0;
  const KEY = "d92cdc67-1dec-4cea-86c5-672f1404e23d";
  const HTTPADRESS = "https://www.dictionaryapi.com";
  let wordObject;

  /** Set up event listeners on load. */
  function initializePage() {
    // Resets screen
    performScroll();
    document.getElementById("search-btn").addEventListener("click", search);
    document.getElementById("add-btn")
      .addEventListener("click", addDefinitionToList);
    window.addEventListener('keydown', handleKey);
    window.addEventListener('mousewheel', handleScroll);
    window.addEventListener('DOMMouseScroll', handleScroll);
    listenToNav();
  }

  /**
   * Set up navigation using keys
   * @param{Event} event - event that triggered function
   */
  function handleKey(event) {
    let sections = document.querySelectorAll("section:not(.hidden)");

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

  /**
   * Creates listeners for the navigation tabs.
   */
  function listenToNav() {
    let nav = document.querySelectorAll("a");
    nav.forEach((tab) => {
      tab.addEventListener('click', handleTab);
    });
  }

  /**
   * Handles navigation of the tabs.
   */
  function handleTab() {
    event.preventDefault();
    let sections = document.querySelectorAll("section:not(.hidden)");
    if (this.innerHTML === "List") {
      sectionIndex = sections.length - 1;
    } else if (this.innerHTML === "Home") {
      sectionIndex = 0;
    }
    performScroll();
  }

  /**
   * Performs search if passed word is valid, else shows an error message.
   */
  function search() {
    hideSearch();
    let word = document.getElementById("word-input");
    if (wordCheck(word.value)) {
      lookWord(word.value.toLowerCase());
    } else {
      let errorMessage = document.getElementById("error-message-type");
      errorMessage.classList.remove("hidden");
      setTimeout(function() {
        errorMessage.classList.add("hidden");
      }, 2000);
    }
    word.value = "";
  }

  /**
   * Resets and hides search sections.
   */
  function hideSearch() {
    let resultsScreen = document.getElementById("results");
    let list = resultsScreen.querySelector("div");
    list.innerHTML = "";

    let wordsScreen = document.getElementById("word-picker");
    list = wordsScreen.querySelector("div");
    list.innerHTML = "";

    let editScreen = document.getElementById("edit");
    clearEdit();

    resultsScreen.classList.add("hidden");
    wordsScreen.classList.add("hidden");
    editScreen.classList.add("hidden");
  }

  /**
   * Check if passed object is valid string.
   * @param{string} word - word to check
   * @return{boolean} true if word is valid, false otherwise
   */
  function wordCheck(word) {
    return /^[a-zA-Z]+$/.test(word);
  }

  /**
   * Searches passed word using thesaurus API. Parses result and throws an error
   * if response is not status 200.
   * @param{string} word - word to look up
   */
  function lookWord(word) {
    let url = `${HTTPADRESS}/api/v3/references/thesaurus/json/${word}` +
                `?key=${KEY}`;

    fetch(url)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(processData)
      .catch(() => {
        let errorMessage = document.getElementById("error-message-server");
        errorMessage.classList.remove("hidden");
        setTimeout(function() {
          errorMessage.classList.add("hidden");
        }, 2000);
      });
  }

  /**
   * Checks whether respone is ok
   * @param{object} response - response from API
   * @return {object} response from API
   */
  function checkStatus(response) {
    if (!response.ok) { // response.status >= 200 && response.status < 300
      throw Error("Error in request: " + response.statusText);
    }
    return response;
  }

  /**
   * Parses recieved JSON data from API call then shows appropriate screen.
   * @param{object[]} responseData - data recieved from the server
   */
  function processData(responseData) {
    let type = typeof (responseData[0]);
    if (type === "string") {
      handleWordList(responseData);
    } else if (type === "object") {
      handleDefinitionList(responseData);
    } else if (type === "undefined") {
      let errorMessage = document.getElementById("error-message-absent");
      errorMessage.classList.remove("hidden");
      setTimeout(function() {
        errorMessage.classList.add("hidden");
      }, 2000);
    }
  }

  /**
   * Handles first step of selection - correct word pick.
   * Populates list of possible words and scrolls view onto it.
   * @param{string[]} arrayOfWords - array of possible words
   */
  function handleWordList(arrayOfWords) {
    populateWordList(arrayOfWords);
    let wordScreen = document.getElementById("word-picker");
    wordScreen.classList.remove("hidden");
    scrollTo("word-picker");
  }

  /**
   * Takes a list of possible words and displays them to the user
   * @param {string[]} arrayOfWords - array of possible words
   */
  function populateWordList(arrayOfWords) {
    let wordScreen = document.getElementById("word-picker");
    let listOfWords = wordScreen.querySelector("div");

    // Handle all possible words
    arrayOfWords.forEach((word) => {
      let wordEntry = document.createElement("div");
      wordEntry.innerText = word;
      wordEntry.classList.add("word");
      wordEntry.classList.add("choice");
      wordEntry.addEventListener("click", handleWordSelect);
      listOfWords.appendChild(wordEntry);
    });
  }

  /**
   * When word is selected, look it up.
   */
  function handleWordSelect() {
    let word = this.innerText;
    lookWord(word);
  }

  /**
   * Handles second step of selection - correct definition pick.
   * Populates list of possible definitons and scrolls view onto it.
   * If next section - definition, is visible, hides it.
   * @param{object[]} arrayOfDenfinitions - array of possible definitions
   */
  function handleDefinitionList(arrayOfDenfinitions) {
    document.getElementById("results").classList.add("hidden");
    document.getElementById("edit").classList.add("hidden");

    if (arrayOfDenfinitions.length === 0) {
      scrollTo("search");
      let errorMessage = document.getElementById("error-message-absent");
      errorMessage.classList.remove("hidden");
      setTimeout(function() {
        errorMessage.classList.add("hidden");
      }, 2000);
    } else if (arrayOfDenfinitions.length === 1) {
      // move to edit screen
      wordObject = arrayOfDenfinitions[0];
      handleEdit();
    } else {
      // Render all possible definitions
      populateDefinitionList(arrayOfDenfinitions);
      let definitionScreen = document.getElementById("results");
      definitionScreen.classList.remove("hidden");
      scrollTo("results");
    }
  }

  /**
   * Takes a list of possible definitions and displays them to the user
   * @param {object[]} arrayOfDenfinitions - array of possible definitions
   */
  function populateDefinitionList(arrayOfDenfinitions) {
    // let editScreen = document.getElementById("edit");
    let definitionsScreen = document.getElementById("results");
    let listOfDefinitions = definitionsScreen.querySelector("div");

    // Reset list
    listOfDefinitions.innerHTML = "";

    arrayOfDenfinitions.forEach((definition) => {
      let definitionObject = createDefinitionObject(definition);
      listOfDefinitions.appendChild(definitionObject);
    });
  }

  /**
   * Parses passed entry and returns a new DOM-Element representing its
   * definition.
   * @param {object} definition - object representing a definition
   * @return {object} DOM object associated with word
   */
  function createDefinitionObject(definition) {
    let entry = document.createElement("div");
    let pOne = document.createElement("p");
    pOne.innerText = definition.fl;
    let pTwo = document.createElement("p");
    pTwo.innerText = definition.shortdef[0];
    entry.appendChild(pOne);
    entry.appendChild(document.createElement("hr"));
    entry.appendChild(pTwo);
    entry.classList.add("definition");
    entry.classList.add("choice");
    entry.addEventListener("click", function() {
      handleDefinitionSelect(definition);
    });
    return entry;
  }

  /**
   * When definition is selected, proceed to edit screen.
   * @param{object} definition - a definition of a word object
   */
  function handleDefinitionSelect(definition) {
    wordObject = definition;
    handleEdit();
  }

  /**
   * Populates edit section with selected word information; then scrolls to
   * edit section.
   */
  function handleEdit() {
    clearEdit();

    let word = document.getElementById('word');
    let speech = document.getElementById('speech');
    let def = document.getElementById('definition');
    let examples = document.getElementById('examples');

    let editScreen = document.getElementById("edit");

    word.value = wordObject.meta.id;
    speech.value = wordObject.fl;
    for (let i = 0; i < wordObject.def[0].sseq.length; i++) {
      let temp = wordObject.def[0].sseq[i][0];
      def.value += (temp[1].dt[0][1] + ';');
      examples.value += (temp[1].dt[1][1][0].t + ';');
    }

    editScreen.classList.remove("hidden");
    scrollTo("edit");
  }

  /**
   * Resets and hides sections used in search.
   */
  function clearEdit() {
    let word = document.getElementById('word');
    let speech = document.getElementById('speech');
    let def = document.getElementById('definition');
    let examples = document.getElementById('examples');

    word.value = "";
    speech.value = "";
    def.value = "";
    examples.value = "";
  }

  /**
   * Appends definition from the edit screen to list of all definitions.
   */
  function addDefinitionToList() {
    let listScreen = document.getElementById("list");
    let listOfWords = listScreen.querySelector("div");

    let word = document.getElementById('word');
    let speech = document.getElementById('speech');
    let def = document.getElementById('definition');
    let examples = document.getElementById('examples');

    let entry = document.createElement("div");

    let pOne = document.createElement("p");
    pOne.innerHTML = word.value;
    let pTwo = document.createElement("p");
    pTwo.innerHTML = speech.value;
    let pThree = document.createElement("p");
    pThree.innerHTML = "<strong>Definition: </strong>" + def.value;
    let pFour = document.createElement("p");
    pFour.innerHTML = "<strong>Examples: </strong>" + examples.value;
    entry.appendChild(pOne);
    entry.appendChild(pTwo);
    entry.appendChild(document.createElement("hr"));
    entry.appendChild(pThree);
    entry.appendChild(pFour);
    entry.classList.add("definition");
    entry.classList.add("large");

    listOfWords.appendChild(entry);
    scrollTo("list");
    setTimeout(function() {
      hideSearch();
      sectionIndex = 1;
    }, 750);
  }

  /**
   * Handles mouse scroll by moving to previous/next section.
   * @param{event} event - mouse scroll;
   */
  function handleScroll(event) {
    if (event.wheelDelta > 0 || event.detail < 0) {
      scrollPrevious();
    } else {
      scrollNext();
    }
  }

  /**
   * Performs scroll to the next section if next section exists.
   */
  function scrollNext() {
    let sections = document.querySelectorAll("section:not(.hidden)");
    if (sectionIndex < sections.length - 1) {
      sectionIndex += 1;
      performScroll();
    }
  }

  /**
   * Performs scroll to the previous section if next section exists.
   */
  function scrollPrevious() {
    if (sectionIndex > 0) {
      sectionIndex -= 1;
      performScroll();
    }
  }

  /**
   * Scroll to the section, which index equals to sectionIndex.
   */
  function performScroll() {
    let sections = document.querySelectorAll("section:not(.hidden)");
    window.scroll({
      top: sections[sectionIndex].offsetTop,
      left: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Scrolls page to the passed section.
   * @param{string} sectionId - id of the section to scroll to
   */
  function scrollTo(sectionId) {
    let section = document.getElementById(sectionId);
    let visibleSections = document.querySelectorAll("section:not(.hidden)");
    let index = Array.from(visibleSections).indexOf(section);
    if (index >= 0) {
      sectionIndex = index;
      performScroll();
    }
  }
})();
