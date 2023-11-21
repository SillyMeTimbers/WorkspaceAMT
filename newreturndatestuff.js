// ==UserScript==
// @name         [Functional] Better Return Date Editor
// @namespace    http://tampermonkey.net/
// @version      5.10.818A
// @description  Improved buttons to send Dropoff Information
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==
// Variables
(function () {
    'use strict';

    let DropOffButtons_LastVisible = false;
    let CSS_StyleSheetAdded = false
    let DropoffPause = false

    function isDropoffPopupVisible() {
        if (!DropoffPause == true) {
            const textSubmitForm = document.querySelector("#SecondaryPopup");
            const TextForumHeader = document.querySelector("#updateDaysMilesPopup > h2");

            if (TextForumHeader !== null && TextForumHeader.innerHTML == "Reservation Hours") {
                if (
                    textSubmitForm &&
                    textSubmitForm.offsetWidth > 0 &&
                    textSubmitForm.offsetHeight > 0
                ) {
                    $("#SecondaryPopup").css({
                        width: `30%`,
                        marginLeft: `auto`,
                        left: `35%`,
                    })

                    return true;
                }
            }

            if (DropOffButtons_LastVisible) {
                console.log("reset")
                $("#SecondaryPopup").css({
                    width: ``,
                    left: ``,
                    marginLeft: ``,
                })
            }
            DropOffButtons_LastVisible = false;
            return false;
        }
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

    function getDate() {
        let GetTime;
		
		const dDate = $("#expectedReceiveDate").val()
		const dHour = $("#expectedHour").val()
		const dMinute = $("#expectedMinute").val()
		const dAmPm = $("#expectedAmPm").val()
		
		const pDate = $("#Contract_PreferredPickupDate").val();
		const pHour = $("#Contract_PreferredPickupHour").val();
		const pMinute = $("#Contract_PreferredPickupMinute").val();
		const pAmPm = $("#Contract_PreferredPickupAmPm").val();
		
		const disDate = $("#dispatchDateNonFormatted").val();
		
        const dateTime = moment(pDate + ' ' + pHour + ':' + pMinute + ' ' + pAmPm, 'dddd, MMMM D, YYYY h:mm A');
        const formattedDate = dateTime.format('MM/DD/YYYY HH:mm');
        GetTime = formattedDate
    
        if (GetTime === "Invalid date" && $("#pickUpEntityChosen").val()) {
            const dateTime = moment(pDate, 'MM/DD/YYYY H:mm A');
            const formattedDate = dateTime.format('MM/DD/YYYY HH:mm');
            GetTime = formattedDate
        }
    
        return GetTime
    }

    function runWhenDropoffVisible() {
        DropoffPause = true
        if (DropOffButtons_LastVisible === false) {
            DropOffButtons_LastVisible = true;

            const MessagePopup = waitForElement("Body > #SecondaryPopup", 5000)
            if (MessagePopup) {
                console.log("visBisDisLIsHAHA")
                const hoursRequested = $("#hoursRequested").val()

                const nMessagePopup = document.querySelector("#updateDaysMilesPopup")
                nMessagePopup.innerHTML = `` // Reset Content

                const Html_Content = `
	                <h2 class="header">Reservation Hours</h2>

	                <div class="dropoffcontent">
	                    <div class="contactdetails">
	                        <label>
	                            Hours Requested:
	                            <input id="hoursRequested" name="DaysAllowed" type="text" value="${hoursRequested}" class="">
	                        </label>

                            <div class="row">
                                <div class="medium-5 columns" style="padding-left: 0px; padding-right: 0px; width: 60%;">
                                    <label>
                                        Return Date:
                                        <input data-val="true" data-val-date="The field PreferredPickupDate must be a date." id="daysPopupDatePicker" type="text">
                                    </label>
                                </div>

                                <div class="medium-7 columns uh-custom" style="padding-right: 0px; width: 40%;">
                                    <div class="row">
                                        <div class="small-4 columns" style="width: 60%">
                                            <label>
                                                Time:
                                                <select class="preferredPickupTime" data-val="true" data-val-number="The field PreferredPickupHour must be a number." data-val-required="The PreferredPickupHour field is required." id="daysPopupDateHour">
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">5</option>
                                                    <option value="6">6</option>
                                                    <option value="7">7</option>
                                                    <option value="8">8</option>
                                                    <option value="9">9</option>
                                                    <option value="10">10</option>
                                                    <option value="11">11</option>
                                                    <option value="12">12</option>
                                                </select>
                                            </label>
                                        </div>

                                        <div class="small-4 columns" style="width: 40%">
                                            <label>
                                                <br>
                                                <select class="preferredPickupTime" id="daysPopupDateAMPM">
                                                    <option value="AM">AM</option>
                                                    <option value="PM">PM</option>
                                                </select>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
	                    </div>
	                </div>

	                <div class="dropactionButtons">
	                    <div class="large-12 columns actionButtonsPadding">
                            <button type="button" class="right save">Save</button>
                            <button type="button" class="right cancel">Cancel</button>
	                    </div>
	                </div>
	            `
                nMessagePopup.innerHTML = Html_Content;

                var css = `
	                .dropoffcontent {
	                    display: flex;
	                    flex-direction: row;
	                    width: 100%;
	                    height: 100%;
	                    align-items: stretch; /* new */
                        padding-left: 10px;
	                }

	                .contactdetails {
	                    flex-grow: 0;
	                    flex-shrink: 0;
	                    padding-right: 10px;
	                    width: 100%;
	                }

                    .dropactionButtons {
                        padding-left: 10px;
                        padding-right: 10px;
                        width: 100%;
                    }

                    .actionButtonsPadding {
                        padding-left: 0px;
                        padding-right: 0px;
                    }

                    .dropoffButtons {
                        margin-right: 1em !important;
                    }

                    .dateHours {
                        width: calc(50% - 5px)
                    }
	                `,
                    head = document.head || document.getElementsByTagName('head')[0],
                    style = document.createElement('style');

                if (!CSS_StyleSheetAdded) {
                    CSS_StyleSheetAdded = true;

                    head.appendChild(style);
                    style.type = 'text/css';
                    if (style.styleSheet) {
                        style.styleSheet.cssText = css;
                    } else {
                        style.appendChild(document.createTextNode(css));
                    }
                }

                // Datepicker Handler
                const DateBox = $("#daysPopupDatePicker")
                const DateHour = $("#daysPopupDateHour")
                const DateMinute = $("#daysPopupDateMinute")
                const DateAMPM = $("#daysPopupDateAMPM")

                console.log("assign date picker woah")

                console.log(getDate())

                const formatIntoDate = new Date(getDate());
                formatIntoDate.setTime(formatIntoDate.getTime() + (hoursRequested * 60 * 60 * 1000));

                let currentYear = new Date().getFullYear();
                let nextYear = currentYear + 1;

                DateBox.datepicker({
                    dateFormat: "mm/dd/yy",
                    minDate: 0,
                    yearRange: `${currentYear}:${nextYear}`,
                    changeYear: false,
                    changeMonth: true,
                    onSelect: function (dateText) {
                        var selectedDate = $(this).datepicker('getDate');
                        var hours = selectedDate.getHours();
                        var ampm = hours >= 12 ? 'PM' : 'AM';
                        hours = hours % 12;
                        hours = hours ? hours : 12; // Convert 0 to 12 for 12AM

                        DateHour.val(hours);
                        DateAMPM.val(ampm);
                    }
                });

                function updateDateTime() {
                    var date = DateBox.datepicker('getDate');
                    console.log(date); // Check the value of 'date'
                
                    if (!date) {
                        console.error('Date is null!');
                        return; // Stop the function if 'date' is not a valid Date object
                    }

                    var hours = parseInt(DateHour.val(), 10);
                    var ampm = DateAMPM.val();

                    if (ampm === 'PM' && hours < 12) {
                        hours += 12;
                    } else if (ampm === 'AM' && hours === 12) {
                        hours = 0;
                    }

                    date.setHours(hours);

                    console.log("update lol")
                    // Update the datepicker with the new date
                    DateBox.datepicker('setDate', date);
                }

                // Add change event listeners to the dropdowns
                DateHour.add(DateAMPM).on('change', updateDateTime);             
            }
        }
        DropoffPause = false
    }

    // Function to continuously check if the textSubmitForm is visible
    function continuouslyCheckTextSubmitFormVisibility() {
        function addScriptVersion(scriptName, version) {
            let scriptVersionElement = document.createElement('div');
            scriptVersionElement.style.display = 'none'; // Make it hidden
            scriptVersionElement.classList.add('script-version'); // So we can find it later
            scriptVersionElement.dataset.name = scriptName; // Store the script name
            scriptVersionElement.dataset.version = version; // Store the version
            document.body.appendChild(scriptVersionElement);
        }

        addScriptVersion("Dropoff Buttons", "2")

        setInterval(() => {
            if (!DropoffPause && isDropoffPopupVisible()) {
                runWhenDropoffVisible();
            }
        }, 100);
    }

    // Start checking the textSubmitForm visibility
    continuouslyCheckTextSubmitFormVisibility();
})();
