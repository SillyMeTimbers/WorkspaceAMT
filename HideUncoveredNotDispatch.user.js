// ==UserScript==
// @name         [Functional] betterNotDispatch
// @namespace    http://tampermonkey.net/
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==
const NotDispatchCleaner = "5"
let NotDispatchReportLastVisible = false;
let NotDispatchSettings = {
	"UBOX": true,
	"Uncovered": false,
}
//#d94d45
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
	NotDispatchReportLastVisible = false;
	return false;
}

function notDispatchUpdateCheckbox(checkbox) {
	if (checkbox.id === "addUBOX") {
		NotDispatchSettings.UBOX = $(checkbox).prop('checked')
		console.log(`Updated Value to ${NotDispatchSettings.UBOX}`)
	}

	if (checkbox.id === "addUncovered") {
		NotDispatchSettings.Uncovered = $(checkbox).prop('checked')
		console.log(`Updated Value to ${NotDispatchSettings.Uncovered}`)
	}
}

function createCheckbox(id, name, text, defaultValue) {
	// Create the label element
	let label = document.createElement('label');

	// Create the input element
	let input = document.createElement('input');
	input.setAttribute('data-val', 'true');
	input.setAttribute('data-val-required', 'The DownloadNote field is required.');
	input.setAttribute('id', id);
	input.setAttribute('name', name);
	input.setAttribute('type', 'checkbox');
	input.style.marginRight = '5px';

	// Set the checked state based on defaultValue
	input.checked = defaultValue;

	input.addEventListener('change', function() {
		notDispatchUpdateCheckbox(this);
	});

	// Create the span element
	let span = document.createElement('span');
	span.setAttribute('class', 'custom checkbox');

	// Add the input element and span to the label
	label.appendChild(input);
	label.appendChild(document.createTextNode(text));
	label.appendChild(span);
	label.setAttribute('id', `${id}_Holder`);
	label.style.width = "fit-content"

	// Return the label element
	return label;
}

// Function to run when the OverdueSearchResultsDiv is visible
function runWhenNotDispatchReport() {
	if (document.querySelector("#addUBOX_Holder") == null) {
		const IncludeUBOX = createCheckbox('addUBOX', 'NotDispatchPanel.addUBox', 'Include U-Box', NotDispatchSettings.UBOX);
		document.querySelector("#NotDispatchedResults_wrapper > div.DTTT_container").appendChild(IncludeUBOX);

		const IncludeUncovered = createCheckbox('addUncovered', 'NotDispatchPanel.addUncovered', 'Include 781008', NotDispatchSettings.Uncovered);
		document.querySelector("#NotDispatchedResults_wrapper > div.DTTT_container").appendChild(IncludeUncovered);
	}

	const tbody = document.querySelector("#NotDispatchedResults > tbody");
	tbody.querySelectorAll("tr").forEach((tr) => {
		const locationId = tr.querySelector("td:nth-child(8)").textContent.trim();
		const EquipType = tr.querySelector("td:nth-child(7)").textContent.trim();

		const rawDate = tr.querySelector("td:nth-child(6)").textContent.trim();

		if(rawDate && !tr.hasAttribute("data-processed")) {
			const pickupTime = new Date(rawDate);
			if(isNaN(pickupTime)) return; // skip if pickupTime is not a valid date

			const currentTime = new Date();
			const differenceInMilliseconds = currentTime - pickupTime;
			const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
			const differenceInHours = Math.floor(differenceInMinutes / 60);
			const differenceInDays = Math.floor(differenceInHours / 24);

			let elapsedTime = "";
			if (differenceInDays > 0) {
				elapsedTime += `${differenceInDays}d `;
				elapsedTime += `${differenceInHours % 24}hr `;
			} else if (differenceInHours > 0) {
				elapsedTime += `${differenceInHours}hr `;
			}
			elapsedTime += `${differenceInMinutes % 60}min`;

			const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			const day = pickupTime.getDate();
			const month = monthNames[pickupTime.getMonth()];
			const year = pickupTime.getFullYear();
			const hours = pickupTime.getHours();
			const minutes = String(pickupTime.getMinutes()).padStart(2, '0');
			const amPm = hours < 12 ? "AM" : "PM";
			const formattedHour = hours > 12 ? hours - 12 : hours;
			const formattedDate = `${month} ${day}th, ${year} ${formattedHour}:${minutes} ${amPm} | ${elapsedTime}`;

			tr.querySelector("td:nth-child(6)").textContent = formattedDate;

			if (differenceInMinutes > 60) {
				tr.classList.add("latePU");
			} else {
				tr.classList.remove("latePU");
			}

			// Mark row as processed
			tr.setAttribute("data-processed", "true");
		}

		// Rest of your logic for hiding rows based on conditions
		const ignoreLocations = ['781008'];
		const ignoreEquipment = ['AA', 'AB'];

		let shouldHide = false;
		if(NotDispatchSettings.Uncovered == false && ignoreLocations.some(location => locationId.endsWith(location))) {
			shouldHide = true;
		} else if ((NotDispatchSettings.UBOX == false && ignoreEquipment.some(equipment => EquipType.includes(equipment)))) {
			shouldHide = true;
		}

		if (shouldHide) {
			tr.style.display = "none";
		} else {
			tr.style.display = "";
		}
	});


	let FlipVal = true;
	// Adjust the background color of visible rows
	const $visibleRows = $(tbody).find("> tr");
	$visibleRows.each(function(index) {
		if (index % 2 === 0) { // Even row
			$(this).addClass('even-row').removeClass('odd-row');
		} else {  // Odd row
			$(this).addClass('odd-row').removeClass('even-row');
		}
	});
}

// Function to continuously check if the textSubmitForm is visible
function isNotDispatchReportVisibleCheck() {
	function addScriptVersion(scriptName, version) {
		let scriptVersionElement = document.createElement('div');
		scriptVersionElement.style.display = 'none'; // Make it hidden
		scriptVersionElement.classList.add('script-version'); // So we can find it later
		scriptVersionElement.dataset.name = scriptName; // Store the script name
		scriptVersionElement.dataset.version = version; // Store the version
		document.body.appendChild(scriptVersionElement);
	}

	addScriptVersion("Not Dispatch Organizer", NotDispatchCleaner)

	setInterval(() => {
		if (isNotDispatchReportVisible()) {
			runWhenNotDispatchReport();
			NotDispatchReportLastVisible = true;
		}
	}, 100);
}

isNotDispatchReportVisibleCheck();
