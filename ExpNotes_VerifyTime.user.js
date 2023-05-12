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

// Add the CSS style for hover effect
let VerifyStyle = document.createElement('style');
VerifyStyle.innerHTML = ".contract-row { " + "background-color: #5e6472; " + "} " + ".contract-row.has-no-note:hover, " + ".contract-row.has-no-note:nth-child(even):hover, " + ".contract-row.has-no-note:nth-child(odd):hover { " + "background-color: #A2A7B2; " + "}";
document.head.appendChild(VerifyStyle);

// ... all the code from the first script

// ... all the code from the second script

// Function to continuously check if the textSubmitForm is visible
function continuouslyCheckTextSubmitFormVisibility() {
    setInterval(() => {
        tbody = document.querySelector("#ExpectedInTable > tbody");
        VerifyTbody = document.querySelector("#ExpectedInTable > tbody");

        if (isExpectedInTableWrapperVisible() || isVerifyExpectedInTableWrapperVisible()) {
            runScriptWhenVisible();
            runVerifyScriptWhenVisible();
            getRawIdOfContractsWithoutNotes();
            getRawIdOfContractsWithoutVerified();
        } else {
            processedContracts.clear();
            processedVerifiedContracts.clear();
        }
    }, 1000); // Check every 1000ms
}

// Start checking the textSubmitForm visibility
continuouslyCheckTextSubmitFormVisibility();
