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
  const contractCreatedMatch = text.match(/^Contract created by\s+(\d+) on (\d{2}\/\d{2}\/\d{4}) (\d{2}:\d{2} (AM|PM))\.$/);
  if (contractCreatedMatch) {
    const date = new Date(contractCreatedMatch[2] + ' ' + contractCreatedMatch[3]);
    return {
      text: `Contract created by ${contractCreatedMatch[1]} on ${date.toLocaleString('en-US', {
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
      previous: formatHoursToDaysYears(oldHours)
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
      previous: `Previously: ${reservedModelChangeMatch[1]}`
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

	addScriptVersion("Improved History Screen", "5")

	setInterval(() => {
		updateHistoryScreen()
	}, 100); // Check every 100ms
}

runPaymentImprovement();
