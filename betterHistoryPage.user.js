// ==UserScript==
// @name         [Experimental] betterHistoryPage
// @namespace    http://tampermonkey.net/
// @description  Custom template for message templates
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==

let historyCSS_StyleSheetAdded = false
function getOrdinal(n) {
	var s = ["th", "st", "nd", "rd"],
		v = n % 100;
	return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatChange(text) {
	// For date changes
	if (text.startsWith("Due date/time changed") || text.startsWith("Pick up date/time changed") {
		const dateMatch = text.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}) to (\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
		if (dateMatch) {
			const oldDate = new Date(dateMatch[1]);
			const newDate = new Date(dateMatch[2]);
			const formattedNewDate = newDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
			const formattedOldDate = oldDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
			const eventType = text.startsWith('Pick up') ? 'Pick up' : 'Due date';
			return { text: `${eventType} date/time changed to ${formattedNewDate}`, previous: `Previously: ${formattedOldDate}` };
		}
	}

	// For rate changes
	if (text.startsWith("Rental rate changed")) {
		const rateMatch = text.match(/changed from (\d+.\d{2}) to (\d+(?:\.\d{2})?)/);
		if (rateMatch) {
			return { text: `Rental rate changed to ${parseFloat(rateMatch[2]).toFixed(2)}`, previous: `Previously: ${parseFloat(rateMatch[1]).toFixed(2)}` };
		}	
	}

	// Return the original text if no matches
	return { text: text, previous: '' };
}


function updateHistoryScreen() {
	const HistoryTableDirec = document.querySelector(`[data-slug="section7"]`);

	if (HistoryTableDirec) {

		var css = `
			.tooltip-content {
				opacity: 0;
				z-index: 999;
				visibility: hidden; /* Initial state is hidden */
				position: absolute;
				font-weight: normal;
				font-size: 1em;
				line-height: 1.3;
				border: solid 1px #cccccc;
				color: #555;
				background: #fff;
				border-radius: 3px;
				pointer-events: none;
				padding: 0.5em;
				transition: opacity 0.2s, visibility 0.2s;
				top: 100%;
				left: 0;
				margin-top: 10px;
			}

			.tooltip-wrapper:hover .tooltip-content {
				opacity: 1;
				visibility: visible; /* Display on hover */
			}

			.tooltip-wrapper {
				cursor: help;
				position: relative; /* Ensure this is set so the child's absolute positioning is relative to this parent */
			}
            `,
			head = document.head || document.getElementsByTagName('head')[0],
			style = document.createElement('style');

		if (!historyCSS_StyleSheetAdded) {
			historyCSS_StyleSheetAdded = true;

			head.appendChild(style);
			style.type = 'text/css';
			if (style.styleSheet) {
				style.styleSheet.cssText = css;
			} else {
				style.appendChild(document.createTextNode(css));
			}
		}

		const HistoryData = HistoryTableDirec.querySelector("table")
		// Your iteration code:
		$(`[data-slug="section7"] table tr`).each(function() {
			if ($(this).attr("sorted") != "true") {
				let Response = $(this).find("td:nth-child(4)");

				const formattedResponse = formatChange(Response.text());

				if (formattedResponse.previous) {  // If there's a "previous" tooltip text
					// Create tooltip structure
					let tooltipContent = $('<span class="tooltip-content"></span>').text(formattedResponse.previous);
					let tooltipWrapper = $('<div class="tooltip-wrapper"></div>').append(formattedResponse.text, tooltipContent);
					Response.empty().append(tooltipWrapper);
				} else {
					Response.text(formattedResponse.text);
				}

				$(this).attr("sorted", "true");
			}
		});
	}
}

// Function to continuously check if the textSubmitForm is visible
function runPaymentImprovement() {
	function addScriptVersion(scriptName, version) {
		let scriptVersionElement = document.createElement('div');
		scriptVersionElement.style.display = 'none'; // Make it hidden
		scriptVersionElement.classList.add('script-version'); // So we can find it later
		scriptVersionElement.dataset.name = scriptName; // Store the script name
		scriptVersionElement.dataset.version = version; // Store the version
		document.body.appendChild(scriptVersionElement);
	}

	addScriptVersion("Improved History Screen", "4")

	setInterval(() => {
		updateHistoryScreen()
	}, 100); // Check every 100ms
}

runPaymentImprovement();
