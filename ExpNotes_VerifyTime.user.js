// ==UserScript==
// @name         [Functional] Add Notes and Verify Exp-In Date/Time
// @namespace    http://tampermonkey.net/
// @version      5.12.1120P
// @description  Coolio
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==
const VerifyReturnVersion = "1"

// Styles
function injectCSS(css) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
}

const ExpectedInNoNotes = `
    tr.noNote:not(.open),
    .wrapper > .row > .large-10 > section .item table tr.noNote:not(.open) {
        background: #89c2d9;
    }
    tr.noNote:not(.open) td,
    .wrapper > .row > .large-10 > section .item table tr.noNote:not(.open) td {
        color: #fff;
    }
    tr.noNote:not(.open):hover,
    .wrapper > .row > .large-10 > section .item table tr.noNote:not(.open):hover {
        background: #a9d6e5;
    }
`;

const ExpectedInNotVerified = `
    tr.noVerify:not(.open),
    .wrapper > .row > .large-10 > section .item table tr.noVerify:not(.open) {
        background: #74c69d;
    }
    tr.noVerify:not(.open) td,
    .wrapper > .row > .large-10 > section .item table tr.noVerify:not(.open) td {
        color: #fff;
    }
    tr.noVerify:not(.open):hover,
    .wrapper > .row > .large-10 > section .item table tr.noVerify:not(.open):hover {
        background: #95d5b2;
    }
`;

injectCSS(ExpectedInNoNotes);
injectCSS(ExpectedInNotVerified);

// Expected-In Note Variables
const ExpectedInNote_UBOXNote = "UBOX";
const ExpectedInNote_DefaultNote = "Provided cx info to drop-off address";

let ExpectedInNote_Button;
let ExpectedInNote_ButtonID = "ExpInNotesButton";
let ExpectedInNote_ContractIdList = [];
let ExpectedInNotes_ProcessedContracts = new Set();
let ExpectedInNotes_PauseUpdating = false;

// Verify Return Time
let VerifyReturn_Button;
let VerifyReturn_ButtonID = "VerifyReturnButton"
let VerifyReturn_ContractIdList = [];
let VerifyReturn_ProcessedContracts = new Set()
let VerifyReturn_PauseUpdating = false;

// Shared Variables
let maxProcessAmount = 300;
let ExpectedInBody;

// Shared Functions
const isExpectedInTableWrapperVisible = () => {
    const expectedInTableWrapper = document.querySelector("#ExpectedInTable_wrapper");
    return (expectedInTableWrapper && expectedInTableWrapper.offsetWidth > 0 && expectedInTableWrapper.offsetHeight > 0);
};

const updateButtonLabel = (button, text, List = [], overrideAmount, timeRemaining) => {
    if (!(button instanceof HTMLElement)) {
        console.log("button is not an HTMLElement or is null!");
        return;
    }

    let MessagePreview;
    if (timeRemaining) {
        MessagePreview = `${overrideAmount || List.length
    } ${text} (Estimated time remaining: ${timeRemaining || "?"
    })`;
    } else {
        MessagePreview = `${overrideAmount || List.length
    } ${text}`;
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

function getEstimatedTimeRemaining(currentIndex, totalContracts, StartTime) {
    const elapsedTime = Date.now() - StartTime;
    const averageTimePerContract = elapsedTime / (currentIndex + 1);
    const remainingContracts = totalContracts - currentIndex - 1;
    const estimatedTimeRemaining = averageTimePerContract * remainingContracts;
    const seconds = Math.round(estimatedTimeRemaining / 1000) % 60;
    const minutes = Math.floor(estimatedTimeRemaining / 1000 / 60);
    return `${minutes}m ${seconds}s`;
}

// Verify Return Functions
const VerifyReturn_ContractsNotVerified = () => {
    if (VerifyReturn_PauseUpdating) {
        return VerifyReturn_ContractIdList
    }

    const VerifyReturn_TempList = [];
    let VerifyReturn_Sorted = 0;

    ExpectedInBody.querySelectorAll("tr").forEach((tr) => {
        if (ExpectedInBody) {
            const VerifyReturnContractID = tr.getAttribute("data-contractid");
            const VerifyReturnIsNotVerified = tr.querySelector(".verified-expectedin-dropoff-default:not([checked])");

            if (ExpectedInBody.querySelector(`tr[data-contractid="${VerifyReturnContractID}"]`)) {
                if (VerifyReturnIsNotVerified && VerifyReturn_Sorted < maxProcessAmount) {
                    VerifyReturn_TempList.push(VerifyReturnContractID);
                    VerifyReturn_Sorted++;

                    ExpectedInBody.querySelector(`tr[data-contractid="${VerifyReturnContractID}"]`).classList.add("noVerify");
                    if (!VerifyReturn_ProcessedContracts.has(VerifyReturnContractID)) {
                     VerifyReturn_ProcessedContracts.add(VerifyReturnContractID)
                    }
                } else {
                    ExpectedInBody.querySelector(`tr[data-contractid="${VerifyReturnContractID}"]`).classList.remove("noVerify");
                }
            }
        }
    });

    VerifyReturn_ContractIdList = VerifyReturn_TempList;
    updateButtonLabel(VerifyReturn_Button, "Unverified Return Time/Date", VerifyReturn_ContractIdList);

    return VerifyReturn_TempList;
}

async function processVerifyReturnContracts() {
    VerifyReturn_Button.disabled = true;
    VerifyReturn_PauseUpdating = true;

    const ContractList = VerifyReturn_ContractsNotVerified()
    let ClockTime_Start;
    let Sorted = 0;

    ClockTime_Start = Date.now()

    for (const CurrentContractID of ContractList) {
        displayVerifyExpectedDatePopup(CurrentContractID)

        await waitForElement("#SecondaryPopup", 10000);
        await wait(500);
        flashScreen("grey", 500); // Add the flash effect

        const submitButton = document.getElementById('expected-in-datetime-submit');
        if (submitButton) {
            submitButton.click();
        }

        await waitForElement("#toast-container", 10000);
        await wait(400);
        const toastSelector = "#toast-container > div > button";
        const button = document.querySelector(toastSelector);
        if (button) {
            button.click();
        }

        Sorted++;
        const EstTimeRemaining = getEstimatedTimeRemaining(Sorted, ContractList.length, ClockTime_Start);
        updateButtonLabel(VerifyReturn_Button, "Unverified Return Time/Date", VerifyReturn_ContractIdList, VerifyReturn_ContractIdList.length - Sorted, EstTimeRemaining);

        // Add a delay between each iteration to allow the UI to update and to avoid overwhelming the server with requests
        await waitForElementToDisappear(toastSelector, 10000);
        await wait(1000);

        const cancelButton = document.getElementById('expected-in-datetime-cancel');
        if (cancelButton) {
            cancelButton.click();
        }
    }

    VerifyReturn_ProcessedContracts.clear()
    updateButtonLabel(VerifyReturn_Button, "Unverified Return Time/Date", 0, "Completed - Reloading Section");

    const ClockTime_Finish = Date.now()
    const RefreshExpectedIn = "#ExpectedIn > header > a";
    const RefreshExpectedInButton = document.querySelector(RefreshExpectedIn);
    if (RefreshExpectedInButton) {
        RefreshExpectedInButton.click();
    }

    await waitForElementToDisappear("#loadingDiv", 10000)
    ShowToastrMessage(`Sent verfiy Time/Date to ${Sorted} Expected-In Contracts, Finished In - ${getDurationBetweenDates(ClockTime_Start, ClockTime_Finish)}`, "Verify Return Time/Date Finished", !0)
    VerifyReturn_PauseUpdating = false;
}

function VerifyReturnVisible() {
    if (!document.getElementById(VerifyReturn_ButtonID) && isExpectedInTableWrapperVisible()) {
        const PrintButtonClone = document.querySelector("#ToolTables_ExpectedInTable_0");
        VerifyReturn_Button = PrintButtonClone.cloneNode(true);
        VerifyReturn_Button.setAttribute("id", VerifyReturn_ButtonID)

        const ExpectedInNote_Span = VerifyReturn_Button.querySelector("span");
        updateButtonLabel(VerifyReturn_Button, "Unverified Return Time/Date");
        ExpectedInNotes_ContractsWithoutNotes();
        PrintButtonClone.parentElement.insertBefore(VerifyReturn_Button, PrintButtonClone.nextSibling);

        VerifyReturn_Button.addEventListener("click", function() {
            processVerifyReturnContracts()
        })
    }
}

// Expected-In Note Functions
function ExpectedInNotes_ContractsWithoutNotes() {
    if (ExpectedInNotes_PauseUpdating) {
        return ExpectedInNote_ContractIdList
    }

    const ExpectedInNotes_TempList = [];
    let ExpectedInNotes_Sorted = 0;

    ExpectedInBody.querySelectorAll("tr").forEach((tr) => {
        if (ExpectedInBody) {
            const ExpInContractID = tr.getAttribute("data-contractid");
            const ExpInNote = tr.querySelector("td.note.has-tip");
            const ExpInContent = tr.textContent;
            const ExpInUBOX = ExpInContent.includes("UBox") || ExpInContent.includes("DB") || ExpInContent.includes("UB");

            if (ExpectedInBody.querySelector(`tr[data-contractid="${ExpInContractID}"]`)) {
                    if (!ExpInNote || (ExpInNote && ExpInNote.textContent.trim() === "" || ExpInNote.textContent.trim().length < 1) && ExpectedInNotes_Sorted < maxProcessAmount) {
                    ExpectedInNotes_TempList.push([ExpInContractID, ExpInUBOX])
                    ExpectedInNotes_Sorted++;
                    ExpectedInBody.querySelector(`tr[data-contractid="${ExpInContractID}"]`).classList.add("noNote");

                    if (!ExpectedInNotes_ProcessedContracts.has(ExpInContractID)) {
                        ExpectedInNotes_ProcessedContracts.add(ExpInContractID)
                    }

                } else {
                    ExpectedInBody.querySelector(`tr[data-contractid="${ExpInContractID}"]`).classList.remove("noNote");
                }
            }
        }
    });

    ExpectedInNote_ContractIdList = ExpectedInNotes_TempList;
    updateButtonLabel(ExpectedInNote_Button, "Expected-In without note(s)", ExpectedInNote_ContractIdList);

    return ExpectedInNotes_TempList;
}

function ExpectedInNotes_GetNote(contractDetails) {
    if (contractDetails[1] == true) {
        return ExpectedInNote_UBOXNote
    }
    return ExpectedInNote_DefaultNote
}

async function processExpectedInNotesContracts() {
    ExpectedInNote_Button.disabled = true;
    ExpectedInNotes_PauseUpdating = true;

    const ContractList = ExpectedInNotes_ContractsWithoutNotes()
    let ClockTime_Start;
    let Sorted = 0;

    ClockTime_Start = Date.now()

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
        const EstTimeRemaining = getEstimatedTimeRemaining(Sorted, ContractList.length, ClockTime_Start);
        updateButtonLabel(ExpectedInNote_Button, "Expected-In without note(s)", ExpectedInNote_ContractIdList, ExpectedInNote_ContractIdList.length - Sorted, EstTimeRemaining);

        await waitForElementToDisappear(toastSelector, 10000);
        await wait(200);
    }

    ExpectedInNotes_ProcessedContracts.clear()
    updateButtonLabel(ExpectedInNote_Button, "Expected-In without note(s)", 0, "Completed - Reloading Section");

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
    function addScriptVersion(scriptName, version) {
        let scriptVersionElement = document.createElement('div');
        scriptVersionElement.style.display = 'none'; // Make it hidden
        scriptVersionElement.classList.add('script-version'); // So we can find it later
        scriptVersionElement.dataset.name = scriptName; // Store the script name
        scriptVersionElement.dataset.version = version; // Store the version
        document.body.appendChild(scriptVersionElement);
    }

    addScriptVersion("Expected-In Buttons", MessageTemplateVersion)
    
    setInterval(() => {
        ExpectedInBody = document.querySelector("#ExpectedInTable > tbody");

        if (isExpectedInTableWrapperVisible()) {
            console.log("Executed [Expected-In Buttons]")

            ExpectedInNotes_ContractsWithoutNotes();
            ExpectedInNotesVisible();

            VerifyReturn_ContractsNotVerified();
            VerifyReturnVisible();
        } else {
            ExpectedInNotes_ProcessedContracts.clear();
            VerifyReturn_ProcessedContracts.clear();
        }
    }, 1000);
}

isExpectedInTableWrapperVisibleChecker();
