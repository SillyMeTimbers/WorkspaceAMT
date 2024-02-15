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

      .oddetails {
          display: flex;
          flex-direction: row;
          margin: 10px !important;
          width: 100%;
          height: 100%;
          align-items: stretch;
      }

      .oddetails > div:nth-child(1) {
        width: calc(60% - 40px);
        padding-left: 10px;
      }

      .oddetails > div:nth-child(2) {
        margin-left: 15px;
        width: 40%;
      }

      #NotesContainer > .notes {
        max-height: 500px;
        overflow: auto;
        padding-top: 10px;
      }

      .TrackingDetails {
        width: 100%;
        height: 100%;
        padding: 0.75em;
        background-color: #fff;
        border: solid 1px #ccc;
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

  function getTrackingType(trackNum) {
    if (trackNum => 26) {
      return "usps"
    } else {
      return "fedex"
    }
  }

  // Function to parse the duration text and return a date object
  function parseDurationToDate(durationText) {
    var parts = durationText.split(' ');
    var days = parseInt(parts[0], 10);
    var hours = parseInt(parts[2], 10);
    var minutes = parseInt(parts[4], 10);

    var date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(date.getHours() - hours);
    date.setMinutes(date.getMinutes() - minutes);

    return date;
  }

  async function waitForElement(selector, timeout = 10000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);

      if ((element) && !(element.display == "none")) {
        return element;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return null;
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

        const EntityId = $(this).find("> :nth-child(6)").text().trim()
        const ResType = $(this).find("> :nth-child(2)").text().trim()
        const ReservationNum = $(this).find("> :nth-child(3)").text().trim()
        const Equipment = $(this).find("> :nth-child(9)").text().trim()
        const CxName = $(this).find("> :nth-child(4)").text().trim()
        const TrackingId = $(this).find("> :nth-child(13)").text().trim().replaceAll(" ", "");
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

        const ViewAddDetails = $(this).find('li > a[onclick*="BuildContractNoteView"]');

        // Update Button Text + Listen for click calls
        if (ViewAddDetails.length > 0) {
          ViewAddDetails.text("View/Add Details")

          ViewAddDetails.click(async function () {
            console.log("clicky click")

            let ViewDetailsMenu = await waitForElement("#note-form", 5000)

            if (ViewDetailsMenu) {
              console.log("found")
              ViewDetailsMenu = $("#note-form")
              ViewDetailsMenu.css("overflow")
              
              const KeepNotes = ViewDetailsMenu.find(".notes").clone(true) 
              ViewDetailsMenu.find("> div:nth-child(1)").html(`
              <div class="oddetails">
              <div>
                  <div class="large-6 columns" style="width: 100%; padding: 0;">
                      <div class="row">
                          <div class="large-12 columns">
                              <label>
                                  Custom Note
                                  <textarea cols="20" id="notesTextBox" name="ContractNote.Note" rows="2"></textarea>
                              </label>
                          </div>
                      </div>
                      <div class="row">
                          <div class="large-12 columns">
                              <fieldset class="checkbox">
                                  <legend>Options</legend>
                                  <input value="True" data-val="true" data-val-required="The WorkingNote field is required."
                                      id="hiddenWorkingNoteValue" name="ContractNote.WorkingNote" type="hidden"> <label>
                                      <input id="workingNoteCheck" name="ContractNote.WorkingNote"
                                          onchange="CheckboxChecked(this)" type="checkbox" value="true" disabled=""><input
                                          name="ContractNote.WorkingNote" type="hidden" value="false">
                                      Save as working note
                                      <span class="custom checkbox checked"></span></label>
                                  <label>
                                      <input data-val="true" data-val-required="The SpecialInstructionNote field is required."
                                          id="specialInstructionCheck" name="ContractNote.SpecialInstructionNote"
                                          onchange="CheckboxChecked(this)" type="checkbox" value="true"><input
                                          name="ContractNote.SpecialInstructionNote" type="hidden" value="false">
                                      Special Instruction Note
                                      <span class="custom checkbox"></span></label>
                              </fieldset>
                          </div>
                      </div>
                  </div>
          
                  <fieldset style="width: 100%; padding: 0; margin: 0;">
                      <legend>
                          Contract Notes:
                      </legend>
                      <div id="NotesContainer"></div>
                  </fieldset>
              </div>
          
              <div>
                  <div class="TrackingDetails">
                      
                  </div>
              </div>
          </div>
              `)

              $("#NotesContainer").append(KeepNotes);
            }
          })
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

    addScriptVersion("Better Overdues", "6")

    setInterval(() => {
      if (isSourceVisible()) {
        Execute();
      }
    }, 100);
  }

  InitializeChecks()
})();
