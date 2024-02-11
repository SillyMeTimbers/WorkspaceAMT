// ==UserScript==
// @name         [Functional] BetterInTownOverdues
// @namespace    http://tampermonkey.net/
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function NotDispatchinjectCSS(css) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  const LatePickup = `
      tr.latePU.odd{
          background: #cb3d36 !important;
      }
      tr.latePU.even{
          background: #bd362f !important;
      }
      tr.latePU td {
          color: #fff !important;
      }
      tr.latePU:hover {
          background: #e35a52 !important;
      }
  `;
  NotDispatchinjectCSS(LatePickup);

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
    const OverdueTable = $("#OverdueEquipmentResultsTable > tbody").find("tr");

    $(OverdueTable).each(function (index, element) {
      const OpenOnlineDoc = $(this).find('li > a[onclick*="OpenOnlineDoc"]');

      if (OpenOnlineDoc.length > 0) {
        const ContractId = $(OpenOnlineDoc).attr("onclick").match(/\d+/)[0];

        const existingLink = $(this).find(`li > a[pos-contract-id="${ContractId}"]`)
        if (existingLink.length > 0) {
          return;
        }

        const EntityId = $(this).find(":nth-child(6)").text().split("\n")[3].trim();
        const ResType = $(this).find(":nth-child(1)").text().split("\n")[3].trim();
        const TrackingId = $(this).find(":nth-child(13)").text().trim().replaceAll(" ", "");
        const ulElement = OpenOnlineDoc.parent().parent();

        function extractDates(inputText) {
          const regex = /\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2} (AM|PM)/g;
          return inputText.match(regex) || [];
        }

        function textToMilliseconds(text) {
          const daysMatch = text.match(/(\d+) Days/);
          const hoursMatch = text.match(/(\d+) Hours/);
          const minutesMatch = text.match(/(\d+) Minutes/);

          const days = daysMatch ? parseInt(daysMatch[1], 10) : 0;
          const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
          const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

          return (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
        }

        const OverdueTime = $(element).find("> :nth-child(10)").text().trim();
        const OverdueStatus = $(element).find("> :nth-child(11)").text().trim();

        if (OverdueStatus.length > 0) {
          const StatusToDate = new Date(extractDates(OverdueStatus)[0]);
          const currentTime = new Date(); // dynamically obtain the current date-time
          const overdueDuration = textToMilliseconds(OverdueTime);

          // Adding a 2-hour padding to the overdueDuration
          const paddedOverdueDuration = overdueDuration + (24 * 60 * 60 * 1000);  // 2 hours in milliseconds
          const timeElapsed = currentTime - StatusToDate;
          if (timeElapsed > paddedOverdueDuration) {
            $(element).addClass("latePU")
          }
        }

        // Create Request Demand-Letter Button
        if (ResType !== "One-way") {
          const RequestDemandLetterButton = OpenOnlineDoc.parent().clone(true);
          RequestDemandLetterButton.find("a")
            .attr("onclick", `javascript:void(0)`)
            .text("Request Demand Letter")
            .attr("request-demand-letter-id", ContractId);

          $(RequestDemandLetterButton).click(function () {
            ConfirmDialog(`Are you sure you want to sent another Demand Letter? Only use this if the original was denied else use the "In-Town Not Returned" in the "Contract Closed" panel.`, "Confirm Request", function (r) {
              if (r === !0) {
                RequestDemandLetter(ContractId)
              }
            })
          })

          ulElement.prepend(RequestDemandLetterButton);
        }

        // Create Tracking Details button
        if (TrackingId > 0) {
          const TrackingDetails = OpenOnlineDoc.parent().clone(true);
          TrackingDetails.find("a")
            .off("click") // Remove existing click event handler
            .on("click", function () {
              fetch('https://api.trackingmore.com/v4/trackings/get?tracking_numbers=92148969002495000022782788', {
                method: 'GET', // The method is GET
                headers: {
                  'Tracking-Api-Key': 'lzmjux1e-f2b4-r6eo-5jgd-el86izwws4f7', // Replace with your actual API key
                  'Content-Type': 'application/json'
                }
              })
                .then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.error('Error:', error));
            })
            .text("View Tracking Details")
            .attr("tracking-button-id", ContractId);

          ulElement.prepend(TrackingDetails);
        }


        // Create Button | View In POS
        const button_ViewInPOS = OpenOnlineDoc.parent().clone(true);
        button_ViewInPOS.find("a")
          .attr("onclick", `OpenPOSLink(${ContractId}, ${EntityId})`)
          .text("View in POS")
          .attr("pos-contract-id", ContractId);

        ulElement.prepend(button_ViewInPOS)
      }
    });
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

    addScriptVersion("Better Overdues", "4")

    setInterval(() => {
      if (isSourceVisible()) {
        Execute();
      }
    }, 100);
  }

  InitializeChecks()
})();
