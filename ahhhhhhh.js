// ==UserScript==
// @name         [Functional] Better InTown Overdues
// @namespace    http://tampermonkey.net/
// @version      4.6.1130P
// @description  try to take over the world!
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==


(function () {
  'use strict';

  // Made new variable names -- Switched some things over to jQuery
  function isSourceVisible() {
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

  function Execute() {
    const tbody = document.querySelector("#OverdueEquipmentResultsTable > tbody");
    const OverdueTable = $("#OverdueEquipmentResultsTable > tbody").find("tr");

    $(OverdueTable).each(function (index, element) {
      const OpenOnlineDoc = $(this).find('li > a[onclick*="OpenOnlineDoc"]')

      if (OpenOnlineDoc) {
        // Information
        const ContractId = $(OpenOnlineDoc).attr("onclick").match(/\d+/)[0];
        const EntityId = $(this).find(":nth-child(6)").text().split("\n")[3].trim();
        const TrackingId = $(this).find(":nth-child(13)").text().trim().replaceAll(" ", "");

        console.log(ContractId)
        console.log(EntityId)
        console.log(TrackingId)
        if ($(this).find("#pos-contract-id")) return

        
      }
    });

    // Iterate through all the rows in the tbody
    // tbody.querySelectorAll("tr").forEach((tr) => {
    //   // Find the li element with the "View On-Line Doc" link
    //   const liElement = tr.querySelector('li > a[onclick*="OpenOnlineDoc"]');

    //   if (liElement) {
    //     // Get the contract ID from the original onclick attribute
    //     const contractId = liElement.getAttribute("onclick").match(/\d+/)[0];

    //     // Get the location ID from the relevant td element
    //     const locationId = tr.querySelector("td:nth-child(6)").textContent.trim();
    //     const TrackingNumber = tr.querySelector("td:nth-child(13)").textContent.trim().replaceAll(" ", "");

    //     // Check if the "Display Contract Notes" link already exists in the row
    //     const existingLink = tr.querySelector(
    //       `li > a[pos-contract-id="${contractId}"]`
    //     );
    //     if (existingLink) {
    //       return;
    //     }

    //     // View in POS || Actually bring you to the menu
    //     const viewInPOS = liElement.parentElement.cloneNode(true);

    //     // Modify the onclick attribute of the cloned li element
    //     viewInPOS
    //       .querySelector("a")
    //       .setAttribute("onclick", `OpenPOSLink(${contractId}, ${locationId})`);

    //     viewInPOS.querySelector("a").textContent = "View in POS";
    //     viewInPOS.querySelector("a").setAttribute("pos-contract-id", contractId);


    //     // Load tracking details
    //     const TrackingDetails = liElement.parentElement.cloneNode(true);

    //     TrackingDetails
    //       .querySelector("a")
    //       .setAttribute("onclick", `window.open("https://www.trackingmore.com/track/en/${TrackingNumber}");`);

    //     TrackingDetails.querySelector("a").textContent = "View Tracking Details";
    //     TrackingDetails.querySelector("a").setAttribute("tracking-button-id", contractId);

    //     const ulElement = liElement.parentElement.parentElement;
    //     ulElement.insertBefore(TrackingDetails, ulElement.firstChild);
    //     ulElement.insertBefore(viewInPOS, ulElement.firstChild);
    //   }
    // });
  }

  // Function to continuously check if the textSubmitForm is visible
  function InitializeChecks() {
    function addScriptVersion(scriptName, version) {
      let scriptVersionElement = document.createElement('div');
      scriptVersionElement.style.display = 'none';
      scriptVersionElement.classList.add('script-version');
      scriptVersionElement.dataset.name = scriptName;
      scriptVersionElement.dataset.version = version;
      document.body.appendChild(scriptVersionElement);
    }

    addScriptVersion("Better Overdues", "Testing")

    setInterval(() => {
      if (isSourceVisible()) {
        Execute();
      }
    }, 100);
  }

  InitializeChecks()
})();
