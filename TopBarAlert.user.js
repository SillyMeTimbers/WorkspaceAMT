// ==UserScript==
// @name         [Functional] Is Reservation Paid
// @namespace    http://tampermonkey.net/
// @version      4.6.1130P
// @description  Shows if res is paid for
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==

const displayText = '($) Reservation is Prepaid/Paid'

function isResPaid() {
  const targetElement = document.querySelector('div.content[data-slug="section6"] table tbody');

  if (targetElement) {
    const rows = targetElement.querySelectorAll("tr");
    let nonZeroFound = false;

    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll("td");

      // Check if the second cell (index 1) and the third cell (index 2) have a value other than "0.00"
      if (cells.length >= 3 && (cells[1].textContent.trim() !== "0.00" || cells[2].textContent.trim() !== "0.00")) {
        nonZeroFound = true;
        break;
      }
    }

    return nonZeroFound;
  } else {
    return false;
  }
}

function addIsPrepaidDivToReservationPopup(targetElement, position) {
  const isPrepaidDivId = 'isPrepaidDiv';
  let isPrepaidDiv = document.querySelector(`#${isPrepaidDivId}`);
  const isPersonInContract = document.querySelector('.whoseViewingStatus:not(#isPrepaidDiv)');

  if (!isPrepaidDiv) { // Create first time
    isPrepaidDiv = document.createElement('div');
    isPrepaidDiv.classList.add('whoseViewingStatus');
    isPrepaidDiv.dataset.contractid = '518120053';
    isPrepaidDiv.style.display = 'block';
    isPrepaidDiv.textContent = displayText;
    isPrepaidDiv.id = isPrepaidDivId;
    isPrepaidDiv.style.backgroundColor = '#bd362f'; // Set the background color to #bd362f
    isPrepaidDiv.style.color = 'white'; // Set the text color to white
    isPrepaidDiv.style.margin = '-1em 0 0.5em'
    targetElement.insertBefore(isPrepaidDiv, targetElement.firstChild);
  } else {
    isPrepaidDiv.textContent = displayText; // Update the text of the isPrepaidDiv element
    isPrepaidDiv.style.backgroundColor = '#bd362f'; // Set the background color to #bd362f
    isPrepaidDiv.style.color = 'white'; // Set the text color to white

    if (isPersonInContract.style.display !== "block") {
      targetElement.insertBefore(isPrepaidDiv, targetElement.firstChild);
      isPrepaidDiv.style.margin = '-1em 0 0.5em'
    } else {
      isPersonInContract.insertAdjacentElement('afterend', isPrepaidDiv);
      isPrepaidDiv.style.margin = '-.5em 0 0.5em'
    }
  }
}

function runWhenReservationPopupVisible() {
  const targetElement = document.querySelector('#ReservationPopup > section > div');

  if (targetElement && isResPaid()) { // Check if the cancelReservationLink id exists on the page
    const cancelReservationLink = document.getElementById('cancelReservationLink');
    if (cancelReservationLink) { // Add the isPrepaidDiv to the top of the list
      addIsPrepaidDivToReservationPopup(targetElement, 'top');
    }
  }
}

// Function to continuously check
function continuouslyCheckReservationPopupVisibility() {
  setInterval(() => {
    runWhenReservationPopupVisible();
  }, 100); // Check every 100ms
}

// Start checking the Reservation Popup visibility
continuouslyCheckReservationPopupVisibility();
