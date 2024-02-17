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
        background: #fbfbfb;
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
        width: 70px;
        height: 50px;
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

      .nums-p {
        max-width: 90%;
        margin-bottom: 0.5em;
        font-weight: bolder;
        overflow: hidden;
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
        margin: 0;
        font-size: larger;
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
    if (trackNum.length >= 26) {
      return "usps"
    } else {
      return "fedex"
    }
  }

  function getSubStatusText(subSetat) {
    const custList = {
      "inforeceived001": "The package is waiting for courier to pick up",
      "transit001": "Package is on the way to destination",
      "transit002": "Package arrived at a hub or sorting center",
      "transit003": "Package arrived at delivery facility",
      "transit004": "Package arrived at destination country",
      "transit005": "Customs clearance completed",
      "transit006": "Item Dispatched",
      "transit007": "Depart from Airport",
      "pickup001": "The package is out for delivery",
      "pickup002": "The package is ready for collection",
      "pickup003": "The customer is contacted before the final delivery",
      "delivered001": "Package delivered successfully",
      "delivered002": "Package picked up by the addressee",
      "delivered003": "Package received and signed by addressee",
      "delivered004": "Package was left at the front door or left with your neighbour",
      "undelivered001": "Address-related issues",
      "undelivered002": "Receiver not home",
      "undelivered003": "Impossible to locate the addressee",
      "undelivered004": "Undelivered due to other reasons",
      "exception004": "The package is unclaimed",
      "exception005": "Other exceptions",
      "exception006": "Package was detained by customs",
      "exception007": "Package was lost or damaged during delivery",
      "exception008": "Logistics order was cancelled before courier pick up the package",
      "exception009": "Package was refused by addressee",
      "exception010": "Package has been returned to sender",
      "exception011": "Package is being sent to sender",
      "notfound002": "No tracking information found",
      "expired001": "The last track of the package has not been updated for 30 days. When this happens, please contact the Courier for more details."
    }

    return custList[subStat] || subStat
  }

  function getIcon(status, substatus) {
    const custList = {
      "transit": `<svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#1E93EB"></circle><mask id="mask0_23_686" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="4" y="5" width="12" height="10"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.20001 5.8H15.825V14.2545H4.20001V5.8Z" fill="white"></path></mask><g mask="url(#mask0_23_686)"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.6545 10.0273V8.70627H13.9755L15.0139 10.0273H12.6545ZM12.3903 12.6693C12.3903 12.2307 12.7444 11.8767 13.183 11.8767C13.6215 11.8767 13.9756 12.2307 13.9756 12.6693C13.9756 13.1079 13.6215 13.4619 13.183 13.4619C12.7444 13.4619 12.3903 13.1079 12.3903 12.6693ZM6.04945 12.6693C6.04945 12.2307 6.40348 11.8767 6.84207 11.8767C7.28065 11.8767 7.63468 12.2307 7.63468 12.6693C7.63468 13.1079 7.28063 13.4619 6.84207 13.4619C6.40348 13.4619 6.04945 13.1079 6.04945 12.6693ZM14.2398 7.91363H12.6545C12.6545 6.7463 11.7082 5.8 10.5409 5.8H5.25684C4.67293 5.8 4.20001 6.27292 4.20001 6.85683V12.6693H5.25684C5.25684 13.5438 5.96754 14.2545 6.84206 14.2545C7.71658 14.2545 8.42729 13.5438 8.42729 12.6693H11.5977C11.5977 13.5438 12.3084 14.2545 13.183 14.2545C14.0575 14.2545 14.7682 13.5438 14.7682 12.6693H15.825V10.0273L14.2398 7.91363Z" fill="white"></path></g></svg>`,
      "delivered": `<svg width="100%" height="100%" viewBox="0 0 38 38" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-616.000000, -132.000000)"><g transform="translate(616.000000, 132.000000)"><circle id="椭圆形备份" fill="#1BBE73" cx="19" cy="19" r="19"></circle><path d="M28.4009664,12.5900492 C29.1996918,13.3768791 29.1996918,14.6525146 28.4009245,15.4393027 L18.2768938,25.4115854 L18.2768938,25.4115854 C17.9405531,25.742847 17.5162349,25.93463 17.0780285,25.9869313 L16.9131843,26.0000044 L16.9131843,26.0000044 L16.7479274,26.0000044 C16.2523427,25.9803848 15.7626232,25.7842326 15.3842598,25.4115435 L9.59907545,19.7131202 C8.80030818,18.9263321 8.80030818,17.6506966 9.59903361,16.8638667 C10.3978427,16.0771205 11.6929004,16.0771205 12.4916676,16.8639086 L16.83,21.138 L25.5083324,12.5900911 C26.3070996,11.803303 27.6021573,11.803303 28.4009664,12.5900492 Z" id="形状结合" fill="#FFFFFF"></path></g></g></g></svg>`,
      "inforeceived": `<svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#00A0AC"></circle><path d="M7.29232 6.29487V8.08974H12.6769V6.29487H13.5775C13.8234 6.29487 14.0231 6.49455 14.0231 6.74045V13.9262C14.023 14.0444 13.976 14.1576 13.8925 14.2412C13.8089 14.3247 13.6957 14.3717 13.5775 14.3718H6.39174C6.27361 14.3717 6.16034 14.3247 6.0768 14.2412C5.99327 14.1576 5.94629 14.0444 5.94617 13.9262V6.74045C5.94617 6.49455 6.14585 6.29487 6.39174 6.29487H7.29232ZM8.18976 5.39744H11.7795V7.19231H8.18976V5.39744Z" fill="white"></path><path d="M10.7415 13.5C10.7415 14.7813 11.7802 15.82 13.0615 15.82C14.3429 15.82 15.3815 14.7813 15.3815 13.5C15.3815 12.2187 14.3429 11.18 13.0615 11.18C11.7802 11.18 10.7415 12.2187 10.7415 13.5Z" fill="white" stroke="#00A0AC" stroke-width="0.64"></path></svg>`,
      "undelivered": `<svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#525252"></circle><path fill-rule="evenodd" clip-rule="evenodd" d="M14.0938 7.39486C14.5049 6.98378 14.5049 6.31729 14.0938 5.90622C13.6827 5.49514 13.0162 5.49514 12.6051 5.90621L10 8.51135L7.39487 5.90621C6.98379 5.49514 6.3173 5.49514 5.90622 5.90621C5.49515 6.31729 5.49515 6.98378 5.90622 7.39486L8.51135 9.99999L5.90622 12.6051C5.49515 13.0162 5.49515 13.6827 5.90622 14.0938C6.3173 14.5048 6.98379 14.5048 7.39487 14.0938L10 11.4886L12.6051 14.0938C13.0162 14.5048 13.6827 14.5048 14.0938 14.0938C14.5049 13.6827 14.5049 13.0162 14.0938 12.6051L11.4886 9.99999L14.0938 7.39486Z" fill="white"></path></svg>`,
      "pickup": `<svg width="20px" height="20px" viewBox="0 0 38 38"><defs><polygon id="path-1" points="0 0 21 0 21 22 0 22"></polygon></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-700.000000, -132.000000)"><g transform="translate(700.000000, 132.000000)"><circle fill="#FCAF30" cx="19" cy="19" r="19"></circle><g transform="translate(8.500000, 8.000000)"><mask id="mask-2" fill="white"><use xlink:href="#path-1"></use></mask><g id="Clip-2"></g><path d="M20.9768212,5.44163012 L20.9768212,5.39512046 C20.9535971,5.34861081 20.9535971,5.30210115 20.9304636,5.25559149 L20.9304636,5.23233666 C20.9072848,5.185827 20.8608819,5.13931734 20.8377483,5.11606251 L20.8145695,5.09280768 C20.7913455,5.06955285 20.7450331,5.04629802 20.721809,5.02304319 L20.6986302,4.99978836 L20.6754967,4.99978836 L20.6523179,4.97653353 L10.8012792,0.0697644888 C10.615894,-0.0232548296 10.384106,-0.0232548296 10.1754967,0.0697644888 L6.86088188,1.72085739 L16.7582329,6.81366507 L16.7814117,6.8369199 C16.8046358,6.8369199 16.8046358,6.86017473 16.8278146,6.86017473 C16.8509481,6.88342956 16.8509481,6.90668439 16.8741722,6.92993922 L16.8741722,6.97644888 L16.8741722,6.99970371 L16.8741722,12.3947788 C16.8741722,12.4878435 16.8278146,12.557608 16.7582329,12.6041176 L14.7648554,13.650585 C14.6490066,13.7203495 14.5098885,13.6738398 14.4403521,13.5575657 C14.4172185,13.5343108 14.4172185,13.4878012 14.4172185,13.4412461 L14.4172185,8.16244519 L4.40392824,2.97661819 L4.3807947,2.95336336 L0.370860927,4.9532787 L0.347682119,4.97653353 L0.324503311,4.97653353 L0.301279232,4.99978836 C0.278145695,5.02304319 0.231788079,5.04629802 0.208609272,5.06955285 L0.185430464,5.09280768 C0.139027577,5.13931734 0.11589404,5.185827 0.0695364238,5.23233666 L0.0695364238,5.25559149 C0.0463576159,5.30210115 0.0231788079,5.34861081 0.0231788079,5.39512046 L0.0231788079,5.44163012 C0.0231788079,5.48813978 0,5.51139461 0,5.55790427 L0,5.5811591 L0,16.4179097 C0,16.6736674 0.139027577,16.9295159 0.394039735,17.0457901 L10.1523179,21.9293043 C10.2913907,21.9990234 10.4536424,22.0223236 10.615894,21.975814 L10.6622064,21.9525591 C10.7086093,21.9525591 10.7317428,21.9293043 10.7781457,21.9060495 L20.6059603,17.0225353 C20.8377483,16.9062611 21,16.6736674 21,16.3946549 L21,5.5811591 L21,5.55790427 C20.9768212,5.51139461 20.9768212,5.48813978 20.9768212,5.44163012" id="Fill-1" fill="#FFFFFF" mask="url(#mask-2)"></path></g></g></g></g></svg>`,
      "exception": `<svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_23_707)"><circle cx="10" cy="10" r="7" fill="white"></circle><path d="M10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20ZM10 13C9.44771 13 9 13.4477 9 14C9 14.5523 9.44771 15 10 15C10.5523 15 11 14.5523 11 14C11 13.4477 10.5523 13 10 13ZM9 5V11H11V5H9Z" fill="#FD5749"></path></g><defs><clipPath id="clip0_23_707"><rect width="20" height="20" fill="white"></rect></clipPath></defs></svg>`,
      "expired": `<svg width="20px" height="20px" viewBox="0 0 38 38"><defs><polygon id="path-1" points="0 0 22 0 22 22 0 22"></polygon></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-532.000000, -132.000000)"><g transform="translate(532.000000, 132.000000)"><circle fill="#8209FF" cx="19" cy="19" r="19"></circle><g transform="translate(8.000000, 8.000000)"><mask id="mask-2" fill="white"><use xlink:href="#path-1"></use></mask><g id="Clip-2"></g><path d="M16.2314453,16.6896641 C16.0526953,16.8684141 15.818043,16.9583906 15.5833906,16.9583906 C15.3487383,16.9583906 15.1139141,16.8684141 14.9353359,16.6896641 L10.3519453,12.1064453 C10.1795547,11.9350859 10.0833906,11.7021094 10.0833906,11.4583906 L10.0833906,5.5 C10.0833906,4.99309766 10.493957,4.58339062 11,4.58339062 C11.506043,4.58339062 11.9166094,4.99309766 11.9166094,5.5 L11.9166094,11.0788906 L16.2314453,15.3935547 C16.5898047,15.7520859 16.5898047,16.3313047 16.2314453,16.6896641 M11,0 C4.93435938,0 0,4.93435938 0,11 C0,17.0656406 4.93435938,22 11,22 C17.0656406,22 22,17.0656406 22,11 C22,4.93435938 17.0656406,0 11,0" id="Fill-1" fill="#FFFFFF" mask="url(#mask-2)"></path></g></g></g></g></svg>`,
    }

    const custListSub = {
      "undelivered002": `<svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#8209FF"></circle><mask id="mask0_105_396" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="4" y="4" width="12" height="12"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.21045 4.21057H15.7894V15.7895H4.21045V4.21057Z" fill="white"></path></mask><g mask="url(#mask0_105_396)"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.7533 12.9946C12.6592 13.0887 12.5357 13.136 12.4122 13.136C12.2887 13.136 12.1651 13.0887 12.0712 12.9946L9.65884 10.5824C9.56811 10.4922 9.5175 10.3696 9.5175 10.2413V7.10531C9.5175 6.83852 9.73358 6.62288 9.99992 6.62288C10.2663 6.62288 10.4823 6.83852 10.4823 7.10531V10.0416L12.7533 12.3124C12.9419 12.5011 12.9419 12.806 12.7533 12.9946ZM9.99992 4.21057C6.80748 4.21057 4.21045 6.8076 4.21045 10C4.21045 13.1925 6.80748 15.7895 9.99992 15.7895C13.1924 15.7895 15.7894 13.1925 15.7894 10C15.7894 6.8076 13.1924 4.21057 9.99992 4.21057Z" fill="white"></path></g></svg>`
    }

    if (substatus && custListSub[substatus]) {
      return custListSub[substatus]
    } else {
      return custList[status]
    }
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function convertTimestamp(timestamp) {
    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return `${month}/${day}/${year} ${hours}:${minutes}`;
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
          
                      <div id="TrackingList">
                        <div id="NoTracking" style="display: none; padding: 5px 0;">No tracking information has been synced with this contract.</div>
                      </div>
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
                      <div class="status-icon"></div>
                      <div class="nums-info">
                          <div class="tc-flex tc-flex-center">
                              <div class="tc-flex tc-flex-center" style="width: 100%;">
                                  <span title="" data-tooltip class="nums-p"></span>
                              </div>
                          </div>

                          <div class="status" style="user-select: none;">
                              <div class="status-color" style="color: rgb(0, 0, 0);"></div>
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
                <div class="box"></div>
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
                let TrackingNumbersFound = {}
                function addTracking() {
                  $("#TrackingList").html("") // Reset Current Tracking
                  let TrackingAdded = 0

                  console.log(TrackingNumbersFound)
                  $.each(TrackingNumbersFound, async function (indexInArray, valueOfElement) { 
                    const url = 'https://api.trackingmore.com/v4/trackings/get?tracking_numbers=' + valueOfElement;
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
  
                      if (result.data && result.data.length > 0) {
                        $.each(result.data, function (indexInArray, trackingData) {
                          TrackingAdded++
                          $("#NoTracking").hide()
  
                          const TrackingContainer_Holder = $(TrackingContainer_HTML)
                          $("#TrackingList").append(TrackingContainer_Holder);
  
                          const TrackingHeader_Holder = $(TrackingHeader_HTML)
                          TrackingContainer_Holder.find(".trackinginfo").append(TrackingHeader_Holder)
  
                          // Tracking #
                          TrackingHeader_Holder.find(".nums-p").text(trackingData.tracking_number)
                          TrackingHeader_Holder.find(".nums-p").attr("title", trackingData.tracking_number)
  
                          // Status
                          TrackingHeader_Holder.find(".status-icon").html(getIcon(trackingData.delivery_status))
                          TrackingHeader_Holder.find(".status-color").text(capitalizeFirstLetter(trackingData.delivery_status) + " - " + getSubStatusText(trackingData.substatus))
  
                          // Info
                          TrackingHeader_Holder.find(".time").text(convertTimestamp(trackingData.latest_checkpoint_time))
                          TrackingHeader_Holder.find(".tc-info").text(trackingData.latest_event)
  
                          $.each(trackingData.origin_info.trackinfo, function(index, deliveryData) {
                            const TrackingItem_Holder = $(TrackingItem_HTML)
                            TrackingContainer_Holder.find(".trackinginfoList").append(TrackingItem_Holder)
  
                            // Icon
                            TrackingItem_Holder.find(".box").html(getIcon(deliveryData.checkpoint_delivery_status, deliveryData.checkpoint_delivery_substatus))
  
                            // Info-Text
                            TrackingItem_Holder.find(".info-text").text(deliveryData.tracking_detail)
                            
                            // Info-Span
                            if (deliveryData.location !== null) {
                              TrackingItem_Holder.find(".info-span").text(convertTimestamp(deliveryData.checkpoint_date) + " • " + deliveryData.location)
                            } else {
                              TrackingItem_Holder.find(".info-span").text(convertTimestamp(deliveryData.checkpoint_date))
                            }
                          })
                          console.log("Addy")
                        });
                      }
                    } catch (error) {
                      console.error(error);
                    }
                  });

                  if (TrackingAdded <= 0) {
                    $("#NoTracking").show()
                  } else {
                    $("#NoTracking").hide()
                  }
                }

                function findAllTracking() {
                  let tempTrackingFound = [];
                  tempTrackingFound.push(TrackingId)
                
                  // Check Notes
                  $("#NotesContainer > .notes > li").each(function() {
                    var pText = $(this).find('p').text();
                    var fedExTrackingRegex = /(\d{4})\s*(\d{4})\s*(\d{4})/;
   
                    if (fedExTrackingRegex.test(pText)) {
                      var trackingNumberMatch = pText.match(fedExTrackingRegex);
                      var trackingNumber = `${match[1]}${match[2]}${match[3]}`.replaceAll(" ", "");
                      
                      if (trackingNumber) {
                        tempTrackingFound.push(trackingNumber);
                      }
                    }
                  });

                  return tempTrackingFound
                }                

                TrackingNumbersFound = findAllTracking()
                addTracking()

                SyncTracking.click(function () {
                  TrackingNumbersFound = findAllTracking()
                  if (TrackingNumbersFound.length > 0) {

                    $.each(TrackingNumbersFound, function (indexInArray, TrackingNum) { 
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
                          "courier_code": "${getTrackingType(TrackingNum)}",
                          "order_number": "${ReservationNum}",
                          "customer_name": "${CxName}",
                          "tracking_number": "${TrackingNum}"
                        }`
                      };
  
                      $.ajax(settings)
                        .done(function (response) {
                          if (response.meta.code == 200) {
                            ShowToastrMessage(`Synced ${TrackingNum} to Database, updates will be sent via email as they become available.`, "Tracking Database");
                            addTracking()
                          }
                          console.log(response);
                        })
                        .fail(function (jqXHR, textStatus, errorThrown) {
                          ShowToastrError(`Unable to sync ${TrackingNum}, Reason: ${jqXHR.responseJSON.meta.message}`, "Tracking Database");
                          console.warn("Tracking Sync Failed:", jqXHR.responseJSON);
                        });
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

    addScriptVersion("Better Overdues", "10")

    setInterval(() => {
      if (isSourceVisible()) {
        Execute();
      }
    }, 100);
  }

  InitializeChecks()
})();
