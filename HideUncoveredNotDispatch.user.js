// ==UserScript==
// @name         [Functional] Not Dispatched Report - Hide 781008
// @namespace    http://tampermonkey.net/
// @version      4.6.1130P
// @description  try to take over the world!
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==
console.log("Started [Hide 781008 Not Dispatched Contracts] Build #1")
let NotDispatchReportLastVisible = false;
let NotDispatchSettings = {
    "UBOX": true,
}

// Function to check if the OverdueSearchResultsDiv is visible
function isNotDispatchReportVisible() {
    const NotDispatchReportDiv = document.querySelector(
        "#NotDispatchedResults_wrapper"
    );
    if (
        NotDispatchReportDiv &&
        NotDispatchReportDiv.offsetWidth > 0 &&
        NotDispatchReportDiv.offsetHeight > 0
    ) {
        return true;
    }
    NotDispatchReportLastVisible = false;
    return false;
}

function notDispatchUpdateCheckbox(checkbox) {
    if (checkbox.id === "addUBOX") {
       NotDispatchSettings = $(checkbox).prop('checked')
    }
}

function createCheckbox(id, name, text, defaultValue) {
    // Create the label element
    let label = document.createElement('label');

    // Create the first input element
    let input1 = document.createElement('input');
    input1.setAttribute('data-val', 'true');
    input1.setAttribute('data-val-required', 'The DownloadNote field is required.');
    input1.setAttribute('id', id);
    input1.setAttribute('name', name);
    input1.setAttribute('onchange', 'notDispatchUpdateCheckbox(this)');
    input1.setAttribute('type', 'checkbox');
    input1.setAttribute('value', defaultValue);

    // Create the second input element
    let input2 = document.createElement('input');
    input2.setAttribute('name', name);
    input2.setAttribute('type', 'hidden');
    input2.setAttribute('value', 'false');

    // Create the span element
    let span = document.createElement('span');
    span.setAttribute('class', 'custom checkbox');

    // Add the input elements and span to the label
    label.appendChild(input1);
    label.appendChild(document.createTextNode(text));
    label.appendChild(input2);
    label.appendChild(span);

    // Return the label element
    return label;
}

// Function to run when the OverdueSearchResultsDiv is visible
function runWhenOverdueVisible() {
    if (NotDispatchReportLastVisible == false) {
        createCheckbox('addUBOX', 'NotDispatchPanel.addUBox', 'Add U-Box', 'true');
    }

    const tbody = document.querySelector("#NotDispatchedResults > tbody");
    tbody.querySelectorAll("tr").forEach((tr) => {
        const locationId = tr.querySelector("td:nth-child(8)").textContent.trim();
        const EquipType = tr.querySelector("td:nth-child(7)").textContent.trim();

        console.log(NotDispatchSettings.UBOX)
        const ignoreLocations = ['781008'];
        const ignoreEquipment = ['AA', 'AB'];
        const shouldHide = ignoreLocations.some(extension => locationId.endsWith(extension));
        if (shouldHide == true) {
            tr.remove()
        }
    });

    //let FlipVal = false;
    tbody.querySelectorAll("tr").forEach((tr) => {
        tr.classList.remove("odd")
        tr.classList.remove("even")
    });
}

// Function to continuously check if the textSubmitForm is visible
function isNotDispatchReportVisibleCheck() {
    setInterval(() => {
        if (isNotDispatchReportVisible()) {
            runWhenOverdueVisible();
            NotDispatchReportLastVisible = true;
        }
    }, 100);
}

isNotDispatchReportVisibleCheck();
