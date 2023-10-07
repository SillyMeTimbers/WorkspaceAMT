// ==UserScript==
// @name         [Exp] Auto update Unrented Equipment
// @namespace    http://tampermonkey.net/
// @version      4.6.1130P
// @description  blahblalba
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==
let isRunning = false;
let isUnrentedVisible = false

function isNoteTabVis() {
	const SearchForum = document.querySelector("#InventorySearchForm")
	const isUnrentedForum = SearchForum && SearchForum.querySelector("input")

	if (isUnrentedForum && isUnrentedForum.value == "UnrentedEquipment") {
		return true
	}

	isUnrentedVisible = false;
	return false
}

function centerScrollbar() {
	// Get the scrollable body
	const scrollableBody = document.querySelector('.dataTables_scrollBody');

	// Get the 'Location' and 'Days Not Rented' columns from the head (for accurate positioning)
	const locationColumn = document.querySelector('th[data-sortedby="Location"]');
	const daysNotRentedColumn = document.querySelector('th[data-sortedby="DaysNotRented"]');

	// Ensure both columns were found
	if (!locationColumn || !daysNotRentedColumn) {
		console.error("Could not find both columns");
		return;
	}

	// Get the left offsets and widths of the columns
	const locationLeftOffset = locationColumn.offsetLeft;
	const daysNotRentedRightOffset = daysNotRentedColumn.offsetLeft + daysNotRentedColumn.offsetWidth;

	// Calculate the midpoint between the two columns
	const midpoint = (locationLeftOffset + daysNotRentedRightOffset) / 2;

	// Adjust the scroll position of the body to match the header
	scrollableBody.scrollLeft = midpoint - (scrollableBody.offsetWidth / 2);
}

function adjustMaxHeight(padding = 185) {
	const targetElement = document.querySelector('#InventoryResults_wrapper > div.dataTables_scroll > div.dataTables_scrollBody');

	// Ensure the target element is found
	if (!targetElement) {
		console.error("Could not find the target element");
		return;
	}

	// Set the max-height to the viewport height
	targetElement.style.maxHeight = window.innerHeight - padding + 'px';
}

function waitForElement(selector, callback, checkInterval = 100, timeout = 10000) {
	let totalWait = 0;

	const interval = setInterval(() => {
		const element = document.querySelector(selector);

		if (element) {
			clearInterval(interval);
			callback(element);
		}

		// If element is not found and timeout is reached, stop checking
		totalWait += checkInterval;
		if (totalWait >= timeout) {
			clearInterval(interval);
			console.error(`Timeout reached waiting for ${selector}`);
		}
	}, checkInterval);
}

function waitForElementToBeHidden(selector, callback, checkInterval = 100, timeout = 10000) {
	let totalWait = 0;

	const interval = setInterval(() => {
		const element = document.querySelector(selector);

		if (element && getComputedStyle(element).display === 'none') {
			// If the element's display property is 'none'
			clearInterval(interval);
			callback();
		}

		// If the element is still visible and timeout is reached, stop checking
		totalWait += checkInterval;
		if (totalWait >= timeout) {
			clearInterval(interval);
			console.error(`Timeout reached waiting for ${selector} to be hidden`);
		}
	}, checkInterval);
}

function updateScrollStuff() {
	// remove trash video link
	if (document.querySelector("#tutorialVideoLink")) {
		document.querySelector("#tutorialVideoLink").remove()
		document.querySelector("#tutorialTooltip").remove()
	}

	if (document.querySelector("#Header")) {
		document.querySelector("#Header").remove()
	}

	if (document.querySelector("#MainPopup")) {
		document.querySelector("#MainPopup").style.marginTop = "10px"
	}

	if (document.querySelector("body > footer")) {
		document.querySelector("body > footer").remove()
	}

	if (document.querySelector("#InventoryBackButton")) {
		document.querySelector("#InventoryBackButton").remove()
	}

	if (document.querySelector("#excelButton")) {
		document.querySelector("#excelButton").remove()
	}

	if (document.querySelector("#InventorySearch > header > button")) {
		document.querySelector("#InventorySearch > header > button").remove()
	}

	// Call the function to adjust the scrollbar
	centerScrollbar();
	adjustMaxHeight(185);
	document.body.style.overflow = 'hidden';
}

function formatDate(date) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const suffix = ["th", "st", "nd", "rd"];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    let daySuffix = suffix[(day % 10) <= 3 ? (day % 10) : 0];
    if (day >= 11 && day <= 13) {
        daySuffix = "th";
    }

    const hours12Format = hours % 12 || 12;
    const period = hours < 12 ? "AM" : "PM";

    return `Updated at: ${month} ${day}${daySuffix} ${hours12Format}:${String(minutes).padStart(2, '0')} ${period}`;
}

let lastUpdateTime;  // to keep track of the last update time

function displayLastUpdatedTime() {
    // Check if the update element already exists
    let updateElement = document.querySelector("#lastUpdateElement");

    // If not, create it
    if (!updateElement) {
        updateElement = document.createElement("span");
        updateElement.id = "lastUpdateElement";

        const targetDiv = document.querySelector("#InventorySearch > div > div > div > div");
        if (targetDiv) {
            targetDiv.insertBefore(updateElement, targetDiv.firstChild);  // Insert as the first child
        } else {
            console.error("Target div not found!");
            return;
        }
    }

    // Update its content
    updateElement.textContent = formatDate(lastUpdateTime);
}

function UnrentedEquipVisible() {
	function repeatFunction() {
		if (isRunning) {
			updateScrollStuff();
			document.querySelector("#InventorySearchForm > div.row > div > button.right.primary").click();
			const loadingSelector = "#loadingDiv";
			waitForElementToBeHidden(loadingSelector, () => {
				// Update the last updated time
				lastUpdateTime = new Date();
				displayLastUpdatedTime();

				updateScrollStuff();
				setTimeout(repeatFunction, 300 * 1000);
			});
		}
	}

	if (!document.querySelector("#UnrentedEquipmentAuto") && !isRunning) {
		const SubmitButton = document.querySelector("#InventorySearchForm > div.row > div > button.right.primary").cloneNode(true);
		document.querySelector("#InventoryResetButton").parentNode.insertBefore(SubmitButton, document.querySelector("#InventoryResetButton"));

		SubmitButton.id = "UnrentedEquipmentAuto";
		SubmitButton.classList.remove("primary");
		SubmitButton.classList.add("secondary");
		SubmitButton.innerText = "Auto Update";

		document.querySelector("#UnrentedEquipmentAuto").addEventListener("click", function() {
			console.log("fire submission???");
			isRunning = true;

			// Update the last updated time
			lastUpdateTime = new Date();
			displayLastUpdatedTime();

			// Start the repeating function when isRunning is activated
			repeatFunction();
		});
	}
}

// Function to continuously check
function checkUnrentedVis() {
	setInterval(() => {
		if (isNoteTabVis()) {
			UnrentedEquipVisible();
			isUnrentedVisible = true;
		}
	}, 100); // Check every 100ms
}

// Start checking the Reservation Popup visibility
checkUnrentedVis();
