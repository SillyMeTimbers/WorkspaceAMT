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
  // Select the tbody element
  const tbody = document.querySelector("#NotDispatchReportDiv > tbody");

  // Iterate through all the rows in the tbody
  tbody.querySelectorAll("tr").forEach((tr) => {
    // Find the li element with the "View On-Line Doc" link
    const liElement = tr.querySelector('li > a[onclick*="OpenOnlineDoc"]');

    if (liElement) {
      // Get the contract ID from the original onclick attribute
      const contractId = liElement.getAttribute("onclick").match(/\d+/)[0];

      // Get the location ID from the relevant td element
      const locationId = tr.querySelector("td:nth-child(6)").textContent.trim();
      console.log(locationId)
    }
  });
}

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (
      mutation.type === "childList" &&
      isOverdueSearchResultsDivVisible()
    ) {
      setTimeout(() => {
        runWhenOverdueVisible();
      }, 100); // Add a 10ms cooldown
      // No need to disconnect the observer, keep it running
    }
  }
});

// Start observing the DOM changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["style"],
});
