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
console.log("Started [Hide 781008 Not Dispatched Contracts] Build #7")
let NotDispatchReportLastVisible = false;
let NotDispatchSettings = {
    "UBOX": true,
    "Uncovered": true,
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
        NotDispatchSettings.UBOX = $(checkbox).prop('checked')
        console.log(`Updated Value to ${NotDispatchSettings.UBOX}`)
    }

    if (checkbox.id === "addUncovered") {
        NotDispatchSettings.Uncovered = $(checkbox).prop('checked')
        console.log(`Updated Value to ${NotDispatchSettings.Uncovered}`)
    }
}

function createCheckbox(id, name, text, defaultValue) {
    // Create the label element
    let label = document.createElement('label');

    // Create the input element
    let input = document.createElement('input');
    input.setAttribute('data-val', 'true');
    input.setAttribute('data-val-required', 'The DownloadNote field is required.');
    input.setAttribute('id', id);
    input.setAttribute('name', name);
    input.setAttribute('type', 'checkbox');
    input.style.marginRight = '5px';

    // Set the checked state based on defaultValue
    input.checked = defaultValue;

    input.addEventListener('change', function() {
        notDispatchUpdateCheckbox(this);
    });

    // Create the span element
    let span = document.createElement('span');
    span.setAttribute('class', 'custom checkbox');

    // Add the input element and span to the label
    label.appendChild(input);
    label.appendChild(document.createTextNode(text));
    label.appendChild(span);
    label.setAttribute('id', `${id}_Holder`);
    label.style.width = "fitContent"
    
    // Return the label element
    return label;
}

// Function to run when the OverdueSearchResultsDiv is visible
function runWhenNotDispatchReport() {
    if (document.querySelector("#addUBOX_Holder") == null) {
        const IncludeUBOX = createCheckbox('addUBOX', 'NotDispatchPanel.addUBox', 'Include U-Box', NotDispatchSettings.UBOX);
        document.querySelector("#NotDispatchedResults_wrapper > div.DTTT_container").appendChild(IncludeUBOX);
        console.log(IncludeUBOX.querySelector('input').checked);

        const IncludeUncovered = createCheckbox('addUncovered', 'NotDispatchPanel.addUncovered', 'Include 781008', NotDispatchSettings.Uncovered);
        document.querySelector("#NotDispatchedResults_wrapper > div.DTTT_container").appendChild(IncludeUncovered);
        console.log(IncludeUncovered.querySelector('input').checked);
    }

    const tbody = document.querySelector("#NotDispatchedResults > tbody");
    tbody.querySelectorAll("tr").forEach((tr) => {
        const locationId = tr.querySelector("td:nth-child(8)").textContent.trim();
        const EquipType = tr.querySelector("td:nth-child(7)").textContent.trim();

        //  console.log(NotDispatchSettings.UBOX)
        const ignoreLocations = ['781008'];
        const ignoreEquipment = ['AA', 'AB'];
        let shouldHide = false;

        if(NotDispatchSettings.Uncovered == false && ignoreLocations.some(location => locationId.endsWith(location))) {
            shouldHide = true;
        } else if ((NotDispatchSettings.UBOX == false && ignoreEquipment.some(equipment => EquipType.includes(equipment)))) {
            shouldHide = true;
        } else {
            shouldHide = false;
        }

        if (shouldHide == true) {
            tr.style.display = "none";
        } else {
            tr.style.display = null;
        }
    });

    let FlipVal = true;
    tbody.querySelectorAll("tr").forEach((tr) => {
        tr.classList.remove("odd")
        tr.classList.remove("even")

        if (tr.style.display == "none") {
        } else {
            if (FlipVal == false) {
                tr.style.background = "#f1f1f1";
                /// tr.classList.add("odd")
                FlipVal = true;
            } else {
                tr.style.background = '#ffffff';
                //tr.classList.add("even")
                FlipVal = false;
            }
        }
    });
}

// Function to continuously check if the textSubmitForm is visible
function isNotDispatchReportVisibleCheck() {
    setInterval(() => {
        if (isNotDispatchReportVisible()) {
            runWhenNotDispatchReport();
            NotDispatchReportLastVisible = true;
        }
    }, 100);
}

isNotDispatchReportVisibleCheck();
