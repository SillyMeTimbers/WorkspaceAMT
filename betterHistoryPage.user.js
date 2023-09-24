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
	if (text.startsWith("Due date/time changed") || text.startsWith("Pick up date/time changed")) {
		const dateMatch = text.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}) to (\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
		if (dateMatch) {
			const oldDate = new Date(dateMatch[1]);
			const newDate = new Date(dateMatch[2]);
			const formattedNewDate = newDate.toLocaleString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				hour12: true
			});
			const formattedOldDate = oldDate.toLocaleString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				hour12: true
			});
			const eventType = text.startsWith('Pick up') ? 'Pick up' : 'Due date';
			return {
				text: `${eventType} date/time changed to ${formattedNewDate}`,
				previous: `Previously: ${formattedOldDate}`
      };
		}
	}

	// For rate changes
	if (text.startsWith("Rental rate changed")) {
		const rateMatch = text.match(/changed from (\d+.\d{2}) to (\d+(?:\.\d{2})?)/);
		if (rateMatch) {
			return {
				text: `Rental rate changed to ${parseFloat(rateMatch[2]).toFixed(2)}`,
				previous: `Previously: ${parseFloat(rateMatch[1]).toFixed(2)}`
      };
		}
	}

	// For Box quantity changes
	const boxMatch = text.match(/^Box quantity changed from (\d+) to (\d+)$/);
	if (boxMatch) {
		return {
			text: `Box quantity updated to ${boxMatch[2]}`,
			previous: `Previously: ${boxMatch[1]}`
    };
	}

	// For Contract creation
	const contractCreatedMatch = text.match(/^Contract created by\s*(.*?)\s*on (\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2} (AM|PM))\.$/);
	if (contractCreatedMatch) {
		const creator = contractCreatedMatch[1] ? contractCreatedMatch[1].trim() : 'Unknown';
		const date = new Date(contractCreatedMatch[2]);
		return {
			text: `Contract created by ${creator} on ${date.toLocaleString('en-US', {
				month: 'short',
				day: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				hour12: true
			})}`,
			previous: ''
		};
	}

	const contractStatusMatch = text.match(/^Contract status changed from (\w+) to (\w+)( by .+)?$/);
	if (contractStatusMatch) {
		let status = contractStatusMatch[2];
		let oldStatus = contractStatusMatch[1];
		if (status === 'Cancelled') {
			return {
				text: 'Contract was Cancelled',
				previous: `Previously: ${oldStatus}`
      };
		}
		return {
			text: `Contract status changed to ${status}`,
			previous: `Previously: ${oldStatus}`
    };
	}

	// For Contract pickup method changes
	const contractMethodMatch = text.match(/^Contract was changed to (24\/7|Standard)\.$/);
	if (contractMethodMatch) {
		return {
			text: `Pickup method updated to ${contractMethodMatch[1]}`,
			previous: ''
		};
	}

	// EntityCode Changes
	const entityCodeMatch = text.match(/^EntityCode \((From|To) Entity\) changed from (\d+) to (\d+)\.$/);
	if (entityCodeMatch) {
		const entityMap = {
			"From": "Dispatching",
			"To": "Returning"
		};
		const entityType = entityMap[entityCodeMatch[1]];
		return {
			text: `${entityType} Entity updated to ${entityCodeMatch[3]}`,
			previous: `Previously: ${entityCodeMatch[2]}`
    };
	}

	// Follow up Date
	if (text === 'Follow up Date added.') {
		return {
			text: 'Follow up Date added',
			previous: ''
		};
	}

	const followUpDateChangeMatch = text.match(/^Follow up Date changed from (\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}:\d{2} (AM|PM)) to (\d{1,2}\/\d{1,2}\/\d{4})/);
	if (followUpDateChangeMatch) {
		const oldDate = new Date(followUpDateChangeMatch[1]);
		const newDate = new Date(followUpDateChangeMatch[3]);
		return {
			text: `Follow up Date updated to ${newDate.toLocaleString('en-US', {
				month: 'short',
				day: '2-digit',
				year: 'numeric'
			})}`,
			previous: `Previously: ${oldDate.toLocaleString('en-US', {
				month: 'short',
				day: '2-digit',
				year: 'numeric',
			})}`
    };
	}

	// Insurance rate
	const insuranceRateMatch = text.match(/^Insurance rate changed from (\d+) to (\d+)\.$/);
	if (insuranceRateMatch) {
		return {
			text: `Insurance rate updated to $${parseFloat(insuranceRateMatch[2]).toFixed(2)}`,
			previous: `Previously: $${parseFloat(insuranceRateMatch[1]).toFixed(2)}`
    };
	}

	// Insurance type
	const insuranceTypeMatch = text.match(/^Insurance type changed from (.*?) to (.*?)\.$/);
	if (insuranceTypeMatch) {
		return {
			text: `Insurance type updated to ${insuranceTypeMatch[2]}`,
			previous: `Previously: ${insuranceTypeMatch[1]}`
    };
	}

	// Model Changes
	const modelAddedMatch = text.match(/^Model (\w+) has been added to the reservation\.$/);
	const modelRemovedMatch = text.match(/^Model (\w+) has been removed from the reservation\.$/);
	if (modelAddedMatch) {
		return {
			text: `Model ${modelAddedMatch[1]} has been added to the reservation`,
			previous: ''
		};
	} else if (modelRemovedMatch) {
		return {
			text: `Model ${modelRemovedMatch[1]} has been removed from the reservation`,
			previous: ''
		};
	}

	// Rental Hours
	function formatHoursToDaysYears(hours) {
		const HOURS_IN_A_DAY = 24;
		const DAYS_IN_A_YEAR = 365;
		const HOURS_IN_A_YEAR = HOURS_IN_A_DAY * DAYS_IN_A_YEAR;

		const years = Math.floor(hours / HOURS_IN_A_YEAR);
		let remainder = hours % HOURS_IN_A_YEAR;

		const days = Math.floor(remainder / HOURS_IN_A_DAY);
		const remainingHours = remainder % HOURS_IN_A_DAY;

		let formattedDuration = [];

		if (years > 0) {
			formattedDuration.push(`${years}-Year${years > 1 ? 's' : ''}`);
		}
		if (days > 0) {
			formattedDuration.push(`${days}-Day${days > 1 ? 's' : ''}`);
		}
		if (remainingHours > 0) {
			formattedDuration.push(`${remainingHours}-Hour${remainingHours > 1 ? 's' : ''}`);
		}

		return formattedDuration.join(' ');
	}
	const rentalHoursMatch = text.match(/^Rental hours allowed changed from (\d+) to (\d+)\.$/);
	if (rentalHoursMatch) {
		const oldHours = parseInt(rentalHoursMatch[1], 10);
		const newHours = parseInt(rentalHoursMatch[2], 10);
		return {
			text: `Allowed Rental Period updated to ${formatHoursToDaysYears(newHours)}`,
			previous: `Previously: ${formatHoursToDaysYears(oldHours)}`
    };
	}

	// Reservations
	if (text.startsWith('Reservation Covered as Pending Agreement by')) {
		return {
			text: 'Covered with Pending Agreement',
			previous: ''
		};
	}

	if (text.startsWith('Reservation Covered by')) {
		return {
			text: 'Reservation Covered',
			previous: ''
		};
	}

	if (text.startsWith('Reservation Uncovered by')) {
		return {
			text: 'Reservation Uncovered',
			previous: ''
		};
	}

	if (text.startsWith('Reservation scheduled by')) {
		return {
			text: 'Reservation Scheduled',
			previous: ''
		};
	}

	// Reserved Model Changes
	const reservedModelChangeMatch = text.match(/^Reserved model changed from (\w+)\s+to\s+(\w+)\s*\.$/);
	if (reservedModelChangeMatch) {
		return {
			text: `Model ${reservedModelChangeMatch[1]} updated to ${reservedModelChangeMatch[2]}`,
			previous: ``
    };
	}

	// Shipping Rate
	const shippingRateChangeMatch = text.match(/^Shipping rate changed from (\d+\.\d{2}) to (\d+(\.\d{2})?)$/);
	if (shippingRateChangeMatch) {
		return {
			text: `Shipping rate updated to $${parseFloat(shippingRateChangeMatch[2]).toFixed(2)}`,
			previous: `Previously: $${parseFloat(shippingRateChangeMatch[1]).toFixed(2)}`
    };
	}

	// Return the original text if no matches
	return {
		text: '',
		previous: ''
	};
}

function updateHistoryScreen() {
	const HistoryTabDirect = document.querySelector(`[data-slug="section7"]`);
	if (HistoryTabDirect && !HistoryTabDirect.querySelector("#HistoryList")) {
		const HistoryTableDirect = HistoryTabDirect.querySelector("table").cloneNode(true)

		HistoryTabDirect.innerHTML = '';  // Reset Content

		const Html_Content = `
            <div id="HistoryList" class="row">
					<div id="historySearch" class="search-container">
						<svg class="search-icon" width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M22.9583 7.25C27.1244 7.25 31.1199 8.90498 34.0658 11.8509C37.0117 14.7967 38.6667 18.7922 38.6667 22.9583C38.6667 26.8492 37.2408 30.4258 34.8967 33.1808L35.5492 33.8333H37.4583L49.5417 45.9167L45.9167 49.5417L33.8333 37.4583V35.5492L33.1808 34.8967C30.4258 37.2408 26.8492 38.6667 22.9583 38.6667C18.7922 38.6667 14.7967 37.0117 11.8509 34.0658C8.90498 31.1199 7.25 27.1244 7.25 22.9583C7.25 18.7922 8.90498 14.7967 11.8509 11.8509C14.7967 8.90498 18.7922 7.25 22.9583 7.25ZM22.9583 12.0833C16.9167 12.0833 12.0833 16.9167 12.0833 22.9583C12.0833 29 16.9167 33.8333 22.9583 33.8333C29 33.8333 33.8333 29 33.8333 22.9583C33.8333 16.9167 29 12.0833 22.9583 12.0833Z" fill="black" fill-opacity="0.6"/>
						</svg>

						<input type="text" placeholder='Search for keywords...'>

						<!--
						<svg class="filter-icon" width="53" height="53" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M13.25 28.7083H39.75V24.2917H13.25V28.7083ZM6.625 13.25V17.6667H46.375V13.25H6.625ZM22.0833 39.75H30.9167V35.3333H22.0833V39.75Z" fill="#444444"/>
						</svg>
						-->
					</div>

					<div id="historyTab"></div>

					<div id="noResults" style="display: none;">No results found</div>
            </div>
        `
        HistoryTabDirect.innerHTML = Html_Content;

		var css = `
			#HistoryList {
				margin: auto;
			}

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

			.search-container {
				margin-bottom: 10px;
				display: flex;
				align-items: center;
				border: 1px solid #cccccc;
				padding: 5px;
				height: 30px;
				transition: border-color 0.15s linear;
			}

			.search-container input[type="text"] {
				flex-grow: 1;
				border: none;
				outline: none;
				height: 20px; /* inner content height */
				padding-left: 10px;  /* Space between the search icon and input text */
				padding-right: 10px; /* Space between the filter icon and input text */
				font-size: 13px; /* Adjust accordingly to fit within the height */
			}

			.search-icon, .filter-icon {
				height: 20px;  /* inner content height */
				width: auto;
			}

			.search-container input[type="text"]:focus {
				outline: none;
				border-color: transparent;  /* Ensure the input itself doesn't show a border */
				box-shadow: none;  /* Remove any default browser shadow on focus */
				background: white;
			}

			/* Change border color of the container when the input inside it is focused */
			.search-container:focus-within {
				border-color: #999999;  /* Adjust to the darker shade you want */
			}

			.even-row {
    			background: #ffffff !important;
			}

			.odd-row {
    			background: #f1f1f1 !important;
			}

			#noResults {
    			padding-top: 7px;
			}

			input::selection {
				background: transparent;  // Make background of selection transparent
				color: #aaa;  // Make text color of selection light
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

		document.querySelector("#historyTab").appendChild(HistoryTableDirect)
		$(`#historyTab table tr`).each(function() {
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

		// Reference to the search input
		const $searchInput = $('#historySearch input');

		// Listen to the input event
		$searchInput.on('input', function() {
			// Current value of the input
			const query = $(this).val().toLowerCase();

			// Reference to the table rows
			const $rows = $('#historyTab table tbody tr');

			// Filter rows
			$rows.each(function() {
				const text = $(this).text().toLowerCase();  // Get row content
				if (text.indexOf(query) > -1) {
					// If the query is found in the row, display it
					$(this).show();
				} else {
					// If the query isn't found, hide the row
					$(this).hide();
				}
			});

			// Adjust the background color of visible rows
			const $visibleRows = $('#historyTab table tbody tr:visible');
			$visibleRows.each(function(index) {
				if (index % 2 === 0) { // Even row
					$(this).addClass('even-row').removeClass('odd-row');
				} else {  // Odd row
					$(this).addClass('odd-row').removeClass('even-row');
				}
			});

			// Display "No results found" if no rows are visible
			if ($visibleRows.length === 0) {
				$('#noResults').show();
			} else {
				$('#noResults').hide();
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

	addScriptVersion("Improved History Screen", "9")

	setInterval(() => {
		updateHistoryScreen()
	}, 100); // Check every 100ms
}

runPaymentImprovement();
