// ==UserScript==
// @name         [Functional] verifyLocHours
// @namespace    http://tampermonkey.net/
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==

(function () {
	'use strict';

	const LocNotOpenAlertBar = $(`<p id="locClosedAlert" class="alert-danger"><strong>ALERT!</strong> This location will not be open during the selected Date/Time</p>`)
	LocNotOpenAlertBar.hide()

	function injectCSS(css) {
		const style = document.createElement('style');
		style.type = 'text/css';
		style.appendChild(document.createTextNode(css));
		document.head.appendChild(style);
	}

	const CSSToInject = `
	.alert-danger {
		color: #721c24;
		background-color: #f8d7da;
		border-radius: 5px;
		border: 1px solid #721c24; /* Same as text color, thin border */
		width: 100%;
		height: 2em;
		padding-left: 5px;
		padding-top: 2px;
		margin-bottom: 5px;
	  }
	  `;
	injectCSS(CSSToInject);

	function isSourceVisible() {
		const selectionList = document.querySelector(
			"#mapLocationDetails"
		);
		if (
			selectionList &&
			selectionList.offsetWidth > 0 &&
			selectionList.offsetHeight > 0
		) {
			return true;
		}
		return false;
	}

	function locOpen(checkDate) {
		let LocationHours = $("#mapLocationDetails > div.row > div:nth-child(1) > dl.split.small")

		if (LocationHours.length < 1) {
			LocationHours = $("dl.schedule-hours")
		}

		const HolidayInfo = $("#tab-Holidays > div");
		let isOpen = false;
		let isHoliday = false;
		const checkMoment = moment(checkDate, "MM/DD/YYYY HH:mm");

		// Parse Holiday Hours
		HolidayInfo.find('dl.inline').each(function () {
			const start = $(this).find('dd').eq(0).text();
			const end = $(this).find('dd').eq(1).text();
			const startDate = moment(start, "MM/DD/YYYY");
			const endDate = moment(end, "MM/DD/YYYY").endOf('day');

			// Check if checkDate is within the holiday range
			if (checkMoment.isBetween(startDate, endDate, null, '[]')) {
				isHoliday = true; // Mark as holiday
				let holidayTextElements = $(this).nextUntil('hr'); // Get all siblings until the next 'hr' tag
				let closedText = holidayTextElements.filter('p').text().trim(); // Get the text of paragraph elements

				if (closedText.includes("Closed on these days")) {
					isOpen = false; // Closed on this holiday
					return false; // Exit the .each() loop
				} else {
					let hoursText = holidayTextElements.filter('dl').find('dd').text().trim(); // Get the text of dd elements within dl
					if (hoursText) {
						const times = hoursText.split(' to ');
						if (times.length === 2) {
							const openingTime = moment(startDate.format("YYYY-MM-DD") + " " + times[0], "YYYY-MM-DD h:mm A");
							const closingTime = moment(startDate.format("YYYY-MM-DD") + " " + times[1], "YYYY-MM-DD h:mm A");
							if (times[1].includes('PM') && closingTime.hour() < 12) {
								closingTime.add(12, 'hours');
							}
							if (closingTime.isBefore(openingTime)) {
								closingTime.add(1, 'day');
							}
							isOpen = checkMoment.isBetween(openingTime, closingTime, null, '[]'); // Open during these special holiday hours
						}
					}
					return false; // Exit the .each() loop
				}
			}
		});

		// If it's a holiday, return the isOpen status
		if (isHoliday) {
			return [isOpen, true];
		}

		// Regular hours check if not a holiday
		let dayOfWeek = checkMoment.day(); // moment.js treats Sunday as 0, Monday as 1, etc.
		dayOfWeek = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Adjust if your week starts with Monday as 0

		if (LocationHours) {
			const hoursText = LocationHours.find(`dd:eq(${dayOfWeek})`).text().trim();
			const hoursRange = hoursText.split(' - ');

			if (hoursRange.length === 2) {
				const openingTime = moment(checkDate.split(' ')[0] + ' ' + hoursRange[0], "MM/DD/YYYY h:mm A");
				const closingTime = moment(checkDate.split(' ')[0] + ' ' + hoursRange[1], "MM/DD/YYYY h:mm A");

				// Adjust for PM times
				if (hoursRange[1].includes('PM') && closingTime.hour() < 12) {
					closingTime.add(12, 'hours');
				}

				// If the closing time is before the opening time, we assume it closes after midnight
				if (closingTime.isBefore(openingTime)) {
					closingTime.add(1, 'day');
				}

				// Check if the checkMoment is within the range
				isOpen = checkMoment.isBetween(openingTime, closingTime, null, '[]');
			}
		}

		return [isOpen, false]; // Default return if all checks fail
	}

	function Execute() {
		let GetTime;

		const dDate = $("#expectedReceiveDate").val()
		const dHour = $("#expectedHour").val()
		const dMinute = $("#expectedMinute").val()
		const dAmPm = $("#ExpectedAmPm").val()

		const pDate = $("#Contract_PreferredPickupDate").val();
		const pHour = $("#Contract_PreferredPickupHour").val();
		const pMinute = $("#Contract_PreferredPickupMinute").val();
		const pAmPm = $("#Contract_PreferredPickupAmPm").val();

		const disDate = $("#dispatchDateNonFormatted").val();

		if (dDate) {
		    const dateTime = moment(dDate + ' ' + dHour + ':' + dMinute + ' ' + dAmPm, 'MM/DD/YYYY H:mm A');
		    const formattedDate = dateTime.format('MM/DD/YYYY HH:mm');
		    GetTime = formattedDate
		} else {
		    const dateTime = moment(pDate + ' ' + pHour + ':' + pMinute + ' ' + pAmPm, 'dddd, MMMM D, YYYY h:mm A');
		    const formattedDate = dateTime.format('MM/DD/YYYY HH:mm');
		    GetTime = formattedDate

		    if (GetTime === "Invalid date" && $("#pickUpEntityChosen").val()) {
		        const dateTime = moment(pDate, 'MM/DD/YYYY H:mm A');
		        const formattedDate = dateTime.format('MM/DD/YYYY HH:mm');
		        GetTime = formattedDate
		    }

			if (disDate) {
		        const dateTime = moment(disDate, 'MM/DD/YYYY H:mm A');
		        const formattedDate = dateTime.format('MM/DD/YYYY HH:mm');
		        GetTime = formattedDate
			}
		}
		
		const LocOpen = locOpen(GetTime)
		LocNotOpenAlertBar.hide()
		if (LocOpen[0] !== true) {
			if ($("#mapLocationDetails > #locClosedAlert").length < 1) {
				LocNotOpenAlertBar.prependTo("#mapLocationDetails");
				LocNotOpenAlertBar.show()
			} else {
				LocNotOpenAlertBar.show()
			}

			if (LocOpen[1] == true) {
				LocNotOpenAlertBar.html(`<strong>ALERT!</strong> This location will not be open during the selected Date/Time due to holiday hours`)
			} else {
				LocNotOpenAlertBar.html(`<strong>ALERT!</strong> This location will not be open during the selected Date/Time`)
			}
		} else {
			LocNotOpenAlertBar.hide()
		}
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

		addScriptVersion("Verify Loc Hours", "3")

		setInterval(() => {
			if (isSourceVisible()) {
				Execute();
			}
		}, 100);
	}

	InitializeChecks()
})();
