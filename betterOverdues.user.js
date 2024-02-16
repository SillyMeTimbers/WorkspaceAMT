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

      #TrackingList {
        width: 100%;
        height: auto;
        overflow: auto;
        max-height: 600px;
      }

      .TrackingDetails {
        width: 100%;
        height: 100%;
        padding: 0.75em;
        background: #fff;
        border: solid 1px #ccc;
      }

      .trackingContainer {
        border-radius: 5px;
        padding: 0.75em;
        background: #f5f5f5;
        margin-bottom: 10px;
        border: solid 1px #ccc;
      }

      .newtracking {
        width: 100%;
        height: 30px;
        border-radius: 5px;
      }


      .tracking-card-details {
        width: 100%;
        height: 64px;
        cursor: pointer;
      }

      .tracking-card-details .main-info {
        margin-right: 17px;
      }

      .tc-flex {
        display: flex;
      }

      .tc-flex-center {
        align-items: center;
      }

      .tc-flex-between {
        justify-content: space-between;
      }

      .status-icon {
        width: 40px;
        height: 40px;
        margin-right: 10px;
      }

      .status-color {
        color: rgb(0, 0, 0);
        font-size: 14px;
      }

      .tc-info {
        font-size: small;
        text-overflow: ellipsis;
      }


      .track-item {
        position: relative;
        display: flex;
        justify-content: flex-start;
        list-style: none;
        padding-bottom: 10px;
      }

      .track-item-icon {
        margin-right: 10px;
        z-index: 10;
      }

      .track-item-icon .box {
        width: 20px;
        height: 20px;
      }

      .info-span {
        margin-bottom: 3px;
        font-size: 14px;
        color: #6b7280;
      }

      .info-text {
        font-weight: 600;
        color: #0f0f0f;
      }

      .track-item::after {
        display: block;
        width: 1px;
        height: auto;
        content: "";
        position: absolute;
        top: 0px;
        bottom: 0px;
        left: 10px;
        background-color: #ddd;
        z-index: 1;
      }

      .track-item:last-child::after {
        display: none!important;
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
          const currentTime = new Date();
          const overdueDuration = textToMilliseconds(OverdueTime);

          const paddedOverdueDuration = overdueDuration + (24 * 60 * 60 * 1000);
          const timeElapsed = currentTime - StatusToDate;
          if (timeElapsed > paddedOverdueDuration) {
            $(element).addClass("latePU")
          }
        }

        const ViewAddDetails = $(this).find('li > a[onclick*="BuildContractNoteView"]');
        if (ViewAddDetails.length > 0) {
          ViewAddDetails.text("View/Add Details")

          ViewAddDetails.click(async function () {
            let ViewDetailsMenu = await waitForElement("body > #SecondaryPopup", 5000)
            console.log("clicky click")

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
                      <span style="width: 100%; display: block; height: 25px;"><b style="font-size: large;">Associated Tracking Details - ${ReservationNum}</b></span>
                      <button type="button" class="newtracking" style="margin: 0; width: 30%;" >Sync Tracking</button>
                      <hr style="margin: 1em 0 1em;">
          
                      <div id="TrackingList"></div>
                  </div>
              </div>
          </div>
              `)

              const TrackingContainer_HTML = `
              <div class="trackingContainer">
                  <div class="trackinginfo"></div>

                  <hr style="margin: 1em 0 1em;">

                  <div class="trackinginfoList"></div>
              </div>`

              const TrackingHeader_HTML = `
              <div class="tracking-card-details tc-flex tc-flex-center">
              <div class="main-info" style="margin-right: 17px;">
                  <div class="tc-flex">
                      <div class="status-icon"><svg width="100%" height="100%" viewBox="0 0 20 20"
                              fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="10" cy="10" r="10" fill="#525252"></circle>
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                  d="M14.0938 7.39486C14.5049 6.98378 14.5049 6.31729 14.0938 5.90622C13.6827 5.49514 13.0162 5.49514 12.6051 5.90621L10 8.51135L7.39487 5.90621C6.98379 5.49514 6.3173 5.49514 5.90622 5.90621C5.49515 6.31729 5.49515 6.98378 5.90622 7.39486L8.51135 9.99999L5.90622 12.6051C5.49515 13.0162 5.49515 13.6827 5.90622 14.0938C6.3173 14.5048 6.98379 14.5048 7.39487 14.0938L10 11.4886L12.6051 14.0938C13.0162 14.5048 13.6827 14.5048 14.0938 14.0938C14.5049 13.6827 14.5049 13.0162 14.0938 12.6051L11.4886 9.99999L14.0938 7.39486Z"
                                  fill="white"></path>
                          </svg></div>
                      <div class="nums-info">
                          <div class="tc-flex tc-flex-center">
                              <div class="tc-flex tc-flex-center">
                                  <span title="" class="nums-p"style="max-width: 90%; margin-bottom: 0.5em; font-weight: bolder;"></span>
                              </div>
                          </div>

                          <div class="status" style="user-select: none;">
                              <span class="status-color" style="color: rgb(0, 0, 0);"></span>
                          </div>
                      </div>
                  </div>
              </div>

              <div class="tc-flex tc-flex-center tc-flex-between" style="width: 100%;">
                  <div class="tc-flex tc-flex-center tc-flex-between" style="width: 100%;">
                      <div class="last-info uk-width-expand" style="margin-right: 10px;">
                          <span class="time"></span>
                          <span class="tc-info"></span>
                      </div>
                      
                      <div class="card-operate show-detail"><svg width="7" height="12" viewBox="0 0 7 12"
                              fill="none">
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                  d="M1.00025 12C0.74425 12 0.48825 11.902 0.29325 11.707C-0.09775 11.316 -0.09775 10.684 0.29325 10.293L4.58625 6.00001L0.29325 1.70701C-0.09775 1.31601 -0.09775 0.684006 0.29325 0.293006C0.68425 -0.0979941 1.31625 -0.0979941 1.70725 0.293006L6.70725 5.29301C7.09825 5.68401 7.09825 6.31601 6.70725 6.70701L1.70725 11.707C1.51225 11.902 1.25625 12 1.00025 12Z"
                                  fill="#6D7278"></path>
                          </svg></div>
                  </div>
              </div>
          </div>`

          const TrackingItem_HTML = `
          <li class="track-item">
            <div class="track-item-icon">
                <div class="box"><svg width="100%" height="100%" viewBox="0 0 20 20" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="10" fill="#00A0AC"></circle>
                        <path
                            d="M7.29232 6.29487V8.08974H12.6769V6.29487H13.5775C13.8234 6.29487 14.0231 6.49455 14.0231 6.74045V13.9262C14.023 14.0444 13.976 14.1576 13.8925 14.2412C13.8089 14.3247 13.6957 14.3717 13.5775 14.3718H6.39174C6.27361 14.3717 6.16034 14.3247 6.0768 14.2412C5.99327 14.1576 5.94629 14.0444 5.94617 13.9262V6.74045C5.94617 6.49455 6.14585 6.29487 6.39174 6.29487H7.29232ZM8.18976 5.39744H11.7795V7.19231H8.18976V5.39744Z"
                            fill="white"></path>
                        <path
                            d="M10.7415 13.5C10.7415 14.7813 11.7802 15.82 13.0615 15.82C14.3429 15.82 15.3815 14.7813 15.3815 13.5C15.3815 12.2187 14.3429 11.18 13.0615 11.18C11.7802 11.18 10.7415 12.2187 10.7415 13.5Z"
                            fill="white" stroke="#00A0AC" stroke-width="0.64"></path>
                    </svg></div>
            </div>
            <div class="track-item-info">
                <p class="info-span"></p>
                <p class="info-text"></p>
            </div>
        </li>`

              $("#NotesContainer").append(KeepNotes);

              // Handle Tracking
              const SyncTracking = $(".newtracking")

              if (SyncTracking.length > 0) {
                async function addTracking() {
                  $("#trackinginfoList").html("") // Reset Current Tracking

                  const url = 'https://api.trackingmore.com/v4/trackings/get?tracking_numbers=' + TrackingId;
                  const options = {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      Accept: 'application/json',
                      'Tracking-Api-Key': 'qccew7mo-8cyh-2zou-qehc-ekh9yyzbam2n'
                    }
                  };
                  
                  try {
                    const response = await fetch(url, options);
                    const result = await response.json();
                    console.log(result);

                    if (result.data.length > 0) {
                      const TrackingContainer_Holder = $(TrackingContainer_HTML)
                      $("#TrackingList").append(TrackingContainer_Holder);
                    }
                  } catch (error) {
                    console.error(error);
                  }
                }

                addTracking()

                SyncTracking.click(function () {
                  if (TrackingId.length > 0) {
                    const settings = {
                      async: true,
                      crossDomain: true,
                      url: 'https://api.trackingmore.com/v4/trackings/create',
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'Tracking-Api-Key': 'qccew7mo-8cyh-2zou-qehc-ekh9yyzbam2n'
                      },
                      processData: false,
                      data: `
                      {
                        "note": "n/a",
                        "title": "${Equipment}",
                        "language": "en",
                        "courier_code": "${getTrackingType(TrackingId)}",
                        "order_number": "${ReservationNum}",
                        "customer_name": "${CxName}",
                        "tracking_number": "${TrackingId}"
                      }`
                    };

                    $.ajax(settings)
                      .done(function (response) {
                        if (response.meta.code == 200) {
                          ShowToastrMessage(`Synced ${TrackingId} to Database, updates will be sent via email as they become available.`, "Tracking Database");
                        }
                        console.log(response);
                      })
                      .fail(function (jqXHR, textStatus, errorThrown) {
                        ShowToastrError(`Unable to sync ${TrackingId}, Reason: ${jqXHR.responseJSON.meta.message}`, "Tracking Database");
                        console.warn("Tracking Sync Failed:", jqXHR.responseJSON);
                      });
                  } else {
                    ShowToastrError(`No tracking information uploaded has been uploaded to this contract, if you believe this is a mistake please contact Joshua_Mccart@uhaul.com for further assistance.`, "Tracking Database");
                  }
                })
              }
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

    addScriptVersion("Better Overdues", "9")

    setInterval(() => {
      if (isSourceVisible()) {
        Execute();
      }
    }, 100);
  }

  InitializeChecks()
})();
