// ==UserScript==
// @name         [Functional] Add Notes and Verify Exp-In Date/Time
// @namespace    http://tampermonkey.net/
// @version      4.6.1130P
// @description  Coolio
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==

// Expected-In Note Variables
const ExpectedInNote_UBOXNote = "UBOX";
const ExpectedInNote_DefaultNote = "Provided cx info to drop-off address";

const ExpectedInNote_Style = document.createElement('style');
ExpectedInNote_Style.innerHTML = ".contract-row { " + "background-color: #5e6472; " + "} " + ".contract-row.has-no-note:hover, " + ".contract-row.has-no-note:nth-child(even):hover, " + ".contract-row.has-no-note:nth-child(odd):hover { " + "background-color: #A2A7B2; " + "}";
document.head.appendChild(ExpectedInNote_Style);

let ExpectedInNote_Button;
let ExpectedInNote_ButtonID = "ExpInNotesButton";
let ExpectedInNote_ContractIdList = [];
let ExpectedInNotes_ProcessedContracts = new Set();
let ExpectedInNotes_PauseUpdating = false;

// Shared Variables
let maxProcessAmount = 300;
let ExpectedInBody;

// Shared Functions
const isExpectedInTableWrapperVisible = () => {
  const expectedInTableWrapper = document.querySelector("#ExpectedInTable_wrapper");
  return (expectedInTableWrapper && expectedInTableWrapper.offsetWidth > 0 && expectedInTableWrapper.offsetHeight > 0);
};

const updateButtonLabel = (button, text, overrideAmount, timeRemaining) => {
  if (!button) {
    console.log("button has not been created yet!");
    return;
  }

  let MessagePreview;

  if (timeRemaining) {
    MessagePreview = `${overrideAmount || rawContractIdList.length
      } ${text} (Estimated time remaining: ${timeRemaining || "?"
      })`
  } else {
    MessagePreview = `${overrideAmount || rawContractIdList.length
      } ${text}`
  }

  button.setAttribute("title", MessagePreview);
  const buttonSpan = button.querySelector("span");
  buttonSpan.setAttribute("title", MessagePreview);
  buttonSpan.textContent = MessagePreview;
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

function getDurationBetweenDates(start, end) {
  const elapsedTime = end - start;
  const seconds = Math.round(elapsedTime / 1000) % 60;
  const minutes = Math.floor(elapsedTime / 1000 / 60);
  return `${minutes}m ${seconds}s`;
}

function getEstimatedTimeRemaining(currentIndex, totalContracts) {
  const elapsedTime = Date.now() - startTime;
  const averageTimePerContract = elapsedTime / (currentIndex + 1);
  const remainingContracts = totalContracts - currentIndex - 1;
  const estimatedTimeRemaining = averageTimePerContract * remainingContracts;
  const seconds = Math.round(estimatedTimeRemaining / 1000) % 60;
  const minutes = Math.floor(estimatedTimeRemaining / 1000 / 60);
  return `${minutes}m ${seconds}s`;
}

// Expected-In Note Functions
function resetBackgroundColor(contractId) {
  ExpectedInBody.querySelector(`tr[data-contractid="${contractId}"]`).style.backgroundColor = "";
};

async function visualizeList(contracts, hexColor) {
  for (const contractId of contracts) {
    await new Promise((resolve) => setTimeout(resolve, 0)); // wait for the specified delay time
    ExpectedInTbody.querySelector(`tr[data-contractid="${contractId}"]`).style.setProperty('background-color', hexColor);
  }
};

const ExpectedInNotes_ContractsWithoutNotes = () => {
  if (ExpectedInNotes_PauseUpdating) {
    return ExpectedInNote_ContractIdList
  }

  const ExpectedInNotes_TempList = [];
  let ExpectedInNotes_Sorted = 0;

  ExpectedInBody.querySelectorAll("tr").forEach((tr) => {
    const ExpInContractID = tr.getAttribute("data-contractid");
    const ExpInNote = tr.querySelector("td.note.has-tip");
    const ExpInContent = tr.textContent;
    const ExpInUBOX = ExpInContent.includes("UBox") || ExpInContent.includes("DB") || ExpInContent.includes("UB");

    if (!ExpInNote || (ExpInNote && ExpInNote.textContent.trim() === "" || ExpInNote.textContent.trim().length < 1) && ExpectedInNotes_Sorted < maxProcessAmount) {
      ExpectedInNotes_TempList.push([ExpInContractID, ExpInUBOX])
      ExpectedInNotes_Sorted++;
      ExpectedInBody.querySelector(`tr[data-contractid="${ExpInContractID}"]`).classList.add("has-no-note");

      if (!ExpectedInNotes_ProcessedContracts.has(ExpInContractID)) {
        ExpectedInNotes_ProcessedContracts.add(ExpInContractID)
      }

      visualizeList([ExpInContractID], "#ADD8E6")
    } else {
      resetBackgroundColor(ExpInContractID)
      ExpectedInBody.querySelector(`tr[data-contractid="${ExpInContractID}"]`).classList.remove("has-no-note");
    }

    ExpectedInNote_ContractIdList = ExpectedInNotes_Sorted
    updateButtonLabel()

    return ExpectedInNotes_Sorted
  });
};

function ExpectedInNotes_GetNote(contractDetails) {
  if (contractDetails[1] == true) {
    return UboxNote
  }
  return DefaultNote
}

async function processExpectedInNotesContracts() {
  ExpectedInNote_Button.disabled = true;

  const ContractList = ExpectedInNotes_ContractsWithoutNotes()
  let ClockTime_Start;
  let Sorted = 0;

  ClockTime_Start = Date.now()
  ExpectedInNotes_PauseUpdating = true;

  for (const CurrentContractID of ContractList) {
    BuildContractNoteView(CurrentContractID[0])

    await waitForElement("#notesTextBox", 10000);
    await wait(500);
    flashScreen("grey", 500); // Add the flash effect
    $("#notesTextBox").val(ExpectedInNotes_GetNote(CurrentContractID));

    const ExpInNoteCheckBox = document.querySelector(".large-12.columns label:last-of-type .checkbox");
    if (ExpInNoteCheckBox) {
      ExpInNoteCheckBox.click();
    }

    await wait(100);
    const submitButton = document.querySelector("#submit-note");
    if (submitButton) {
      submitButton.click();
    }

    await waitForElement("#toast-container", 10000);
    await wait(200);
    const toastSelector = "#toast-container > div > button";
    const Toastbutton = document.querySelector(toastSelector);
    if (Toastbutton) {
      Toastbutton.click();
    }

    Sorted++;

    // Get Time Remaining
    const EstTimeRemaining = getEstimatedTimeRemaining(Sorted, ContractList.length);
    timeRemainingElement.textContent = `Estimated time remaining: ${EstTimeRemaining}`;
    updateButtonLabel(rawContractIdList.length - Sorted, EstTimeRemaining);

    // Add a delay between each iteration to allow the UI to update and to avoid overwhelming the server with requests
    await waitForElementToDisappear(toastSelector, 10000);
    await wait(200);
  }

  ExpectedInNotes_ProcessedContracts.clear()
  updateButtonLabel(ExpectedInNote_Button, "Expected-In without note(s)", 0, "Completed - Reloading Section");

  // Finished Toaster
  const ClockTime_Finish = Date.now()
  const RefreshExpectedIn = "#ExpectedIn > header > a";
  const RefreshExpectedInButton = document.querySelector(RefreshExpectedIn);
  if (RefreshExpectedInButton) {
    RefreshExpectedInButton.click();
  }

  await waitForElementToDisappear("#loadingDiv", 10000)
  ShowToastrMessage(`Completed ${Sorted} Note(s) in ${getDurationBetweenDates(ClockTime_Start, ClockTime_Finish)}`, "Expected-In Notes Finished", !0)
  ExpectedInNotes_PauseUpdating = false;
}

function ExpectedInNotesVisible() {
  if (!document.getElementById(ExpectedInNote_ButtonID) && isExpectedInTableWrapperVisible()) {
    const PrintButtonClone = document.querySelector("#ToolTables_ExpectedInTable_0");
    ExpectedInNote_Button = PrintButtonClone.cloneNode(true);
    ExpectedInNote_Button.setAttribute("id", ExpectedInNote_ButtonID)

    const ExpectedInNote_Span = ExpectedInNote_Button.querySelector("span");
    updateButtonLabel(ExpectedInNote_Button, "Expected-In without note(s)");
    ExpectedInNotes_ContractsWithoutNotes();
    PrintButtonClone.parentElement.insertBefore(ExpectedInNote_Button, PrintButtonClone.nextSibling);

    ExpectedInNote_Button.addEventListener("click", function() {
      processExpectedInNotesContracts()
    })
  }
}

function isExpectedInTableWrapperVisibleChecker() {
  setInterval(() => {
    ExpectedInBody = document.querySelector("#ExpectedInTable > tbody");

    if (isExpectedInTableWrapperVisible()) {
      ExpectedInNotesVisible();
      ExpectedInNotes_ContractsWithoutNotes();
    } else {
      ExpectedInNotes_ProcessedContracts.clear();
    }
  }, 1000);
}
