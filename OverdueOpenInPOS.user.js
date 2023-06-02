// ==UserScript==
// @name         [Functional] Overdue Equipment - Open POS Link
// @namespace    http://tampermonkey.net/
// @version      4.6.1130P
// @description  try to take over the world!
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==

// Function to check if the OverdueSearchResultsDiv is visible
function isOverdueSearchResultsDivVisible() {
  const OverdueSearchResultsDiv = document.querySelector(
    "#OverdueEquipmentResultsTable"
  );
  if (
    OverdueSearchResultsDiv &&
    OverdueSearchResultsDiv.offsetWidth > 0 &&
    OverdueSearchResultsDiv.offsetHeight > 0
  ) {
    return true;
  }
  return false;
}

// Function to run when the OverdueSearchResultsDiv is visible
function runWhenOverdueVisible() {
  // Select the tbody element
  const tbody = document.querySelector("#OverdueEquipmentResultsTable > tbody");

  // Iterate through all the rows in the tbody
  tbody.querySelectorAll("tr").forEach((tr) => {
    // Find the li element with the "View On-Line Doc" link
    const liElement = tr.querySelector('li > a[onclick*="OpenOnlineDoc"]');

    if (liElement) {
      // Get the contract ID from the original onclick attribute
      const contractId = liElement.getAttribute("onclick").match(/\d+/)[0];

      // Get the location ID from the relevant td element
      const locationId = tr.querySelector("td:nth-child(6)").textContent.trim();

      // Check if the "Display Contract Notes" link already exists in the row
      const existingLink = tr.querySelector(
        `li > a[pos-contract-id="${contractId}"]`
      );
      if (existingLink) {
        return;
      }

      // Duplicate the li element
      const clonedLi = liElement.parentElement.cloneNode(true);

      // Modify the onclick attribute of the cloned li element
      clonedLi
        .querySelector("a")
        .setAttribute("onclick", `OpenPOSLink(${contractId}, ${locationId})`);

      // Update the text of the cloned li element
      clonedLi.querySelector("a").textContent = "View in POS";

      // Set the data-contract-id attribute for the cloned li element
      clonedLi.querySelector("a").setAttribute("pos-contract-id", contractId);

      // Add the cloned li element to the ul at the top of the list
      const ulElement = liElement.parentElement.parentElement;
      ulElement.insertBefore(clonedLi, ulElement.firstChild);
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
      console.log("Started [View In POS - Overdue]")
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
