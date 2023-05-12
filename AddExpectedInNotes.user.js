// ==UserScript==
// @name         [Functional] Add Expected-In Notes
// @namespace    http://tampermonkey.net/
// @version      5.5.1021A
// @description  Coolio
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==

const UboxNote = "UBOX";
const DefaultNote = "Provided cx info to drop-off address";

// Add the CSS style for hover effect
const ExpectedInStyle = document.createElement('style');
ExpectedInStyle.innerHTML = ".contract-row { " + "background-color: #5e6472; " + "} " + ".contract-row.has-no-note:hover, " + ".contract-row.has-no-note:nth-child(even):hover, " + ".contract-row.has-no-note:nth-child(odd):hover { " + "background-color: #A2A7B2; " + "}";
document.head.appendChild(ExpectedInStyle);

const timeRemainingElement = document.createElement("div");
timeRemainingElement.style.position = "fixed";
timeRemainingElement.style.bottom = "0";
timeRemainingElement.style.right = "0";
timeRemainingElement.style.background = "white";
timeRemainingElement.style.border = "1px solid black";
timeRemainingElement.style.padding = "5px";
document.body.appendChild(timeRemainingElement);

let ExpectedInButton; // Reference to Exp-In Notes Button
let rawContractIdList = []; // List of RawIds for Contracts to add Notes
let maxAmount = 300; // Max amount of contracts processed at a time
let ExpectedInTbody; // set tbody
const processedContracts = new Set();
let pauseUpdating = false;

// function to check if the ExpectedInTableWrapper is visible
const isExpectedInTableWrapperVisible = () => {
  const expectedInTableWrapper = document.querySelector("#ExpectedInTable_wrapper");
  return (expectedInTableWrapper && expectedInTableWrapper.offsetWidth > 0 && expectedInTableWrapper.offsetHeight > 0);
};

// Update the text for the button
const updateButtonLabel = (overrideAmount, timeRemaining) => {
  if (!ExpectedInButton) {
    console.log("newButton has not been created yet!");
    return;
  }

  let MessagePreview;

  if (timeRemaining) {
    MessagePreview = `${overrideAmount || rawContractIdList.length
      } Expected-In without note(s) (Estimated time remaining: ${timeRemaining || "?"
      })`
  } else {
    MessagePreview = `${overrideAmount || rawContractIdList.length
      } Expected-In without note(s)`
  }

  ExpectedInButton.setAttribute("title", MessagePreview)
  const ExpectedInButtonSpan = ExpectedInButton.querySelector("span");
  ExpectedInButtonSpan.setAttribute("title", MessagePreview);
  ExpectedInButtonSpan.textContent = MessagePreview
};

function resetBackgroundColor(contractId) {
  ExpectedInTbody.querySelector(`tr[data-contractid="${contractId}"]`).style.backgroundColor = "";
}

async function visualizeList(contracts, hexColor) {
  for (const contractId of contracts) {
    await new Promise((resolve) => setTimeout(resolve, 0)); // wait for the specified delay time
    ExpectedInTbody.querySelector(`tr[data-contractid="${contractId}"]`).style.setProperty('background-color', hexColor);
  }
}

// Modify the getContractsInList function
const getRawIdOfContractsWithoutNotes = () => {
  if (pauseUpdating) {
    return rawContractIdList;
  }

  const tempContractIdList = []; // Clear the previous list
  let stackAmount = 0; // Reset the counter

  ExpectedInTbody.querySelectorAll("tr").forEach((tr) => {
    const contractId = tr.getAttribute("data-contractid");
    const note = tr.querySelector("td.note.has-tip");

    // Check if the contract is not a U-Box reservation
    const contractContent = tr.textContent;
    const isUBoxReservation = contractContent.includes("UBox") || contractContent.includes("DB") || contractContent.includes("UB");

    if (!note || (note && note.textContent.trim() === "" || note.textContent.trim().length < 3) && stackAmount < maxAmount) {
      tempContractIdList.push([contractId, isUBoxReservation]);
      stackAmount++; // increment the counter
      ExpectedInTbody.querySelector(`tr[data-contractid="${contractId}"]`).classList.add("has-no-note");

      if (processedContracts.has(contractId)) { // return; // If the contract has already been processed, skip it
      } else { // ExpectedInTbody.querySelector(`tr[data-contractid="${contractId}"]`).classList.add('contract-row');
        processedContracts.add(contractId);
      } visualizeList([contractId], "#ADD8E6");
    } else {
      resetBackgroundColor(contractId);
      ExpectedInTbody.querySelector(`tr[data-contractid="${contractId}"]`).classList.remove("has-no-note");
    }
  });

  rawContractIdList = tempContractIdList;
  updateButtonLabel(); // Update the button label with the number of expected-ins without notes
  return rawContractIdList;
};

function flashScreen(color = "grey", duration = 1000) {
  const flashOverlay = document.createElement("div");
  flashOverlay.style.position = "fixed";
  flashOverlay.style.zIndex = 9999;
  flashOverlay.style.left = 0;
  flashOverlay.style.top = 0;
  flashOverlay.style.width = "100%";
  flashOverlay.style.height = "100%";
  flashOverlay.style.backgroundColor = color;
  flashOverlay.style.opacity = 0.2;

  document.body.appendChild(flashOverlay);

  setTimeout(() => {
    document.body.removeChild(flashOverlay);
  }, duration);
}

function wait(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

async function waitForElement(selector, timeout = 10000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);

    if (element) {
      return element;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Return null if the element is not found within the timeout period
  return null;
}

async function waitForElementToDisappear(selector, timeout = 30000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);

    if (!element || element.style.display === "none" || element.style.visibility === "hidden") {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

function genNoteForContract(contractDetails) {
  if (contractDetails[1] == true) {
    return UboxNote
  } else {
    return DefaultNote
  }

  return DefaultNote
}

function getDurationBetweenDates(start, end) {
  const elapsedTime = end - start;
  const seconds = Math.round(elapsedTime / 1000) % 60;
  const minutes = Math.floor(elapsedTime / 1000 / 60);
  return `${minutes}m ${seconds}s`;
}

async function processContracts() {
  ExpectedInButton.disabled = true;
  const rawContractList = getRawIdOfContractsWithoutNotes();
  let startTime;
  startTime = Date.now();
  pauseUpdating = true;
  let counter2 = 0;

  function getEstimatedTimeRemaining(currentIndex, totalContracts) {
    const elapsedTime = Date.now() - startTime;
    const averageTimePerContract = elapsedTime / (currentIndex + 1);
    const remainingContracts = totalContracts - currentIndex - 1;
    const estimatedTimeRemaining = averageTimePerContract * remainingContracts;
    const seconds = Math.round(estimatedTimeRemaining / 1000) % 60;
    const minutes = Math.floor(estimatedTimeRemaining / 1000 / 60);
    return `${minutes}m ${seconds}s`;
  }


  for (const contractId of rawContractList) {
    BuildContractNoteView(contractId[0]); // call the BuildContractNoteView function with the contract ID

    await waitForElement("#notesTextBox", 10000);
    await wait(500);
    flashScreen("grey", 500); // Add the flash effect

    $("#notesTextBox").val(genNoteForContract(contractId));

    const checkbox = document.querySelector(".large-12.columns label:last-of-type .checkbox");
    if (checkbox) {
      checkbox.click(); // simulate a button click for the checkbox
    }
    await wait(100);
    const submitButton = document.querySelector("#submit-note");
    if (submitButton) {
      submitButton.click(); // simulate a click on the submit button
    }

    await waitForElement("#toast-container", 10000);
    await wait(200);
    const toastSelector = "#toast-container > div > button";
    const button = document.querySelector(toastSelector);
    if (button) {
      button.click();
    }

    counter2++;

    const EstTimeRemaining = getEstimatedTimeRemaining(counter2, rawContractIdList.length);
    timeRemainingElement.textContent = `Estimated time remaining: ${EstTimeRemaining}`;
    updateButtonLabel(rawContractIdList.length - counter2, EstTimeRemaining);

    // Add a delay between each iteration to allow the UI to update and to avoid overwhelming the server with requests
    await waitForElementToDisappear(toastSelector, 10000);
    await wait(200);
  }

  processedContracts.clear()
  rawContractIdList = []
  updateButtonLabel(0, "Completed - Reloading Section");

  const finishedTime = Date.now()
  const RefreshExpectedIn = "#ExpectedIn > header > a";
  const RefreshExpectedInButton = document.querySelector(RefreshExpectedIn);
  if (RefreshExpectedInButton) {
    RefreshExpectedInButton.click();
  }

  await waitForElementToDisappear("#loadingDiv", 10000)
  ShowToastrMessage(`Completed ${counter2} Note(s) in ${getDurationBetweenDates(startTime, finishedTime)}`, "Expected-In Notes Finished", !0)
  pauseUpdating = false;
}

// run when visible
function runScriptWhenVisible() {
  ExpectedInTbody = document.querySelector("#ExpectedInTable > tbody");
  const ExpectedInButtonId = "ExpInNotesButton";

  if (!document.getElementById(ExpectedInButtonId) && isExpectedInTableWrapperVisible()) {
    const PrintButton = document.querySelector("#ToolTables_ExpectedInTable_0");

    // clone the button
    ExpectedInButton = PrintButton.cloneNode(true);
    // Assign the cloned button to the global variable

    // set a unique ID for the new button
    ExpectedInButton.setAttribute("id", ExpectedInButtonId);

    // update the button label
    const ExpectedInButtonSpan = ExpectedInButton.querySelector("span");
    ExpectedInButtonSpan.setAttribute("title", "0 Expected-In without note(s)");
    ExpectedInButtonSpan.textContent = "Add Expected-In Notes";
    updateButtonLabel()

    getRawIdOfContractsWithoutNotes();

    PrintButton.parentElement.insertBefore(ExpectedInButton, PrintButton.nextSibling);

    ExpectedInButton.addEventListener("click", function () { // Call the function to start processing contracts
      processContracts();
    });
  }
}

function continuouslyCheckTextSubmitFormVisibility() {
  setInterval(() => {
    ExpectedInTbody = document.querySelector("#ExpectedInTable > tbody");

    if (isExpectedInTableWrapperVisible()) {
      runScriptWhenVisible();
      getRawIdOfContractsWithoutNotes();
    } else {
      processedContracts.clear();
    }
  }, 1000); // Check every 1000ms
}

// Start checking the textSubmitForm visibility
continuouslyCheckTextSubmitFormVisibility();
