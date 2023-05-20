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
    return false;
}

// Function to run when the OverdueSearchResultsDiv is visible
function runWhenOverdueVisible() {
    const tbody = document.querySelector("#NotDispatchedResults > tbody");
    tbody.querySelectorAll("tr").forEach((tr) => {
        const locationId = tr.querySelector("td:nth-child(8)").textContent.trim();

        const ignoreLocations = ['781008'];
        const shouldHide = ignoreLocations.some(extension => locationId.endsWith(extension));
        if (shouldHide == true) {
            tr.remove()
        }
    });

    let FlipVal = false;
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
        }
    }, 100);
}

isNotDispatchReportVisibleCheck();
