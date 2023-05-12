// ==UserScript==
// @name         [Functional] Verify Exp-In Date/Time
// @namespace    http://tampermonkey.net/
// @version      4.6.1130P
// @description  Coolio
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==

// Add the CSS style for hover effect
let VerifyStyle = document.createElement('style');
VerifyStyle.innerHTML = ".contract-row { " + "background-color: #5e6472; " + "} " + ".contract-row.has-no-note:hover, " + ".contract-row.has-no-note:nth-child(even):hover, " + ".contract-row.has-no-note:nth-child(odd):hover { " + "background-color: #A2A7B2; " + "}";
document.head.appendChild(VerifyStyle);

const timeRemainingElementVerifyReturn = document.createElement("div");
timeRemainingElementVerifyReturn.style.position = "fixed";
timeRemainingElementVerifyReturn.style.bottom = "0";
timeRemainingElementVerifyReturn.style.right = "0";
timeRemainingElementVerifyReturn.style.background = "white";
timeRemainingElementVerifyReturn.style.border = "1px solid black";
timeRemainingElementVerifyReturn.style.padding = "5px";
document.body.appendChild(timeRemainingElementVerifyReturn);

let VerifyTimeButton; // Reference to Exp-In Notes Button
let VerifyrawContractIdList = []; // List of RawIds for Contracts to add Notes
let VerifymaxAmount = 200; // Max amount of contracts processed at a time
let Verifytbody; // set tbody
let VerifypauseUpdating = false;

// function to check if the ExpectedInTableWrapper is visible
const isExpectedInTableWrapperVisible = () => {
    const expectedInTableWrapper = document.querySelector("#ExpectedInTable_wrapper");
    return (expectedInTableWrapper && expectedInTableWrapper.offsetWidth > 0 && expectedInTableWrapper.offsetHeight > 0);
};

// Update the text for the button
const updateButtonLabel = (overrideAmount, timeRemaining) => {
    if (!VerifyTimeButton) {
        console.log("newButton has not been created yet!");
        return;
    }

    let MessagePreview;

    if (timeRemaining) {
        MessagePreview = `${overrideAmount || VerifyrawContractIdList.length
            } Unverified Return Time/Date (Estimated time remaining: ${timeRemaining || "?"
            })`
    } else {
        MessagePreview = `${overrideAmount || VerifyrawContractIdList.length
            } Unverified Return Time/Date`
    }

    VerifyTimeButton.setAttribute("title", MessagePreview)
    const ExpectedInButtonSpan = VerifyTimeButton.querySelector("span");
    ExpectedInButtonSpan.setAttribute("title", MessagePreview);
    ExpectedInButtonSpan.textContent = MessagePreview
};

// Modify the getContractsInList function
const getRawIdOfContractsWithoutNotes = () => {
    if (VerifypauseUpdating) {
        return VerifyrawContractIdList;
    }

    const tempContractIdList = []; // Clear the previous list
    let stackAmount = 0; // Reset the counter

    Verifytbody.querySelectorAll("tr").forEach((tr) => {
        const contractId = tr.getAttribute("data-contractid");
        const isVerified = tr.querySelector(".verified-expectedin-dropoff-default:not([checked])");

        if (isVerified && stackAmount < VerifymaxAmount) {
            tempContractIdList.push(contractId);
            stackAmount++; // increment the counter

            if (processedContracts.has(contractId)) { // return; // If the contract has already been processed, skip it
            } else { // tbody.querySelector(`tr[data-contractid="${contractId}"]`).classList.add('contract-row');
                processedContracts.add(contractId);
            }
        }
    });

    VerifyrawContractIdList = tempContractIdList;
    updateButtonLabel(); // Update the button label with the number of expected-ins without notes
    return VerifyrawContractIdList;
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

async function processContracts() {
    VerifyTimeButton.disabled = true;
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
        displayVerifyExpectedDatePopup(contractId); // call the displayVerifyExpectedDatePopup function with the contract ID

        await waitForElement("#SecondaryPopup", 10000);
        await wait(400);

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

        counter2++;

        const EstTimeRemaining = getEstimatedTimeRemaining(counter2, VerifyrawContractIdList.length);
        timeRemainingElement.textContent = `Estimated time remaining: ${EstTimeRemaining}`;
        updateButtonLabel(VerifyrawContractIdList.length - counter2, EstTimeRemaining);

        // Add a delay between each iteration to allow the UI to update and to avoid overwhelming the server with requests
        await waitForElementToDisappear(toastSelector, 10000);
        await wait(1000);

        const cancelButton = document.getElementById('expected-in-datetime-cancel');
        if (cancelButton) {
            cancelButton.click();
        }
    }

    processedContracts.clear()
    VerifyrawContractIdList = []
    updateButtonLabel(0, "Completed - Reloading Section");

    const finishedTime = Date.now()
    const RefreshExpectedIn = "#ExpectedIn > header > a";
    const RefreshExpectedInButton = document.querySelector(RefreshExpectedIn);
    if (RefreshExpectedInButton) {
        RefreshExpectedInButton.click();
    }

    await waitForElementToDisappear("#loadingDiv", 10000)
    ShowToastrMessage(`Sent verfiy Time/Date to ${counter2} Expected-In Contracts, Finished In - ${getDurationBetweenDates(startTime, finishedTime)}`, "Expected-In Verify Time/Date Finished", !0)
    pauseUpdating = false;
}

// run when visible
function runScriptWhenVisible() {
    Verifytbody = document.querySelector("#ExpectedInTable > tbody");
    const VerifyTimeButtonId = "VerifyExpInButton";

    if (!document.getElementById(VerifyTimeButtonId) && isExpectedInTableWrapperVisible()) {
        const PrintButton = document.querySelector("#ToolTables_ExpectedInTable_0");

        // clone the button
        VerifyTimeButton = PrintButton.cloneNode(true);
        // Assign the cloned button to the global variable

        // set a unique ID for the new button
        VerifyTimeButton.setAttribute("id", VerifyTimeButtonId);

        // update the button label
        const VerifyTimeButtonSpan = VerifyTimeButton.querySelector("span");
        VerifyTimeButtonSpan.setAttribute("title", "0 Contracts to Verify Time/Date");
        VerifyTimeButtonSpan.textContent = "Verify Time/Date Returns";
        updateButtonLabel()

        getRawIdOfContractsWithoutNotes();

        PrintButton.parentElement.insertBefore(VerifyTimeButton, PrintButton.nextSibling);

        VerifyTimeButton.addEventListener("click", function () { // Call the function to start processing contracts
            processContracts();
        });
    }
}

// Function to continuously check if the textSubmitForm is visible
function continuouslyCheckTextSubmitFormVisibility() {
    setInterval(() => {
        if (isExpectedInTableWrapperVisible()) {
            runScriptWhenVisible();
            getRawIdOfContractsWithoutNotes();
        } else {
            processedContracts.clear();
        }
    }, 1000); // Check every 100ms
}

// Start checking the textSubmitForm visibility
continuouslyCheckTextSubmitFormVisibility();
