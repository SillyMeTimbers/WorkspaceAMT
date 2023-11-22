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

            if (TextForumHeader !== null && TextForumHeader.innerHTML == "Reservation Hours" || TextForumHeader !== null && TextForumHeader.innerHTML == "Reservation Days/Miles") {
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
		
		if (dDate) {
		    const dateTime = moment(dDate + ' ' + dHour + ':' + dMinute + ' ' + dAmPm, 'MM/DD/YYYY h:mm A');
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

        return GetTime
    }

    function runWhenDropoffVisible() {
        DropoffPause = true
        if (DropOffButtons_LastVisible === false) {
            DropOffButtons_LastVisible = true;

            const MessagePopup = waitForElement("Body > #SecondaryPopup", 5000)
            if (MessagePopup) {
                console.log("visBisDisLIsHAHA")

                const isOneWay = $("#extraMilesAllowed").length > 0
                console.log(isOneWay)
                if (isOneWay == true) {
                    console.log("OW-Ref")
                    const daysAllowed = $("#daysAllowed").val()
                    const distanceAllowed = $("#distanceAllowed").val()
                    const ExtraFreeDays = $("#extraDaysAllowedFree").val()
                    const ExtraChargeDays = $("#extraDaysAllowedCharge").val()
                    const ExtraMilesAllowed = $("#extraMilesAllowed").val()

                    const nMessagePopup = document.querySelector("#updateDaysMilesPopup")
                    nMessagePopup.innerHTML = `` // Reset Content

                    const Html_Content = `
                        <h2 class="header">Reservation Days/Miles</h2>
    
                        <input data-val="true" data-val-number="The field ExtraDaysAllowedCharge must be a number." data-val-regex="Please enter a positive whole number only" data-val-regex-pattern="(?:\d*)?\d+" data-val-required="The ExtraDaysAllowedCharge field is required." id="extraDaysAllowedCharge" max="99" maxlength="2" min="0" name="ExtraDaysAllowedCharge" onkeypress="return IsNumberKey(event)" type="hidden" value="${ExtraChargeDays}" aria-describedby="extraDaysAllowedCharge-error" class="valid" aria-invalid="false">
                        <div class="dropoffcontent">
                            <div class="contactdetails">
                                <label>
                                    Days Allowed:
                                    <input id="daysAllowed" type="text" value="${daysAllowed}" disabled>
                                </label>

                                <label>
                                    Additional Days Allowed:
                                    <input id="additionalDaysAllowed" type="text" value="0"} disabled>
                                </label>

                                <label>
                                    Distance Allowed:
                                    <input id="distanceAllowed" type="text" value="${distanceAllowed}" disabled>
                                </label>
    
                                <hr>

                                <div class="row">
                                    <div class="medium-5 columns" style="padding-left: 0px; padding-right: 0px; width: 100%;">
                                        <label>
                                            Return Date:
                                            <input data-val="true" data-val-date="The field PreferredPickupDate must be a date." id="daysPopupDatePicker" type="text">
                                        </label>
                                    </div>
                                </div>

                                <label>
                                    Extra Days Free:
                                    <input data-val="true" data-val-number="The field ExtraDaysAllowedFree must be a number." data-val-regex="Please enter a positive whole number only" data-val-regex-pattern="(?:\d*)?\d+" data-val-required="The ExtraDaysAllowedFree field is required." id="extraDaysAllowedFree" max="99" maxlength="2" min="0" name="ExtraDaysAllowedFree" onkeypress="return IsNumberKey(event)" type="text" value="${ExtraFreeDays}">
                                </label>

                                <label>
                                    Extra Miles Allowed:
                                    <input data-val="true" data-val-number="The field ExtraMilesAllowed must be a number." data-val-regex="Please enter a positive whole number only" data-val-regex-pattern="(?:\d*)?\d+" data-val-required="The ExtraMilesAllowed field is required." id="extraMilesAllowed" max="9999" maxlength="4" min="0" name="ExtraMilesAllowed" onkeypress="return IsNumberKey(event)" type="text" value="${ExtraMilesAllowed}">
                                </label>
                            </div>
                        </div>
    
                        <div class="dropactionButtons">
                            <div class="large-12 columns actionButtonsPadding">
                                <button type="submit" class="right save" onclick="validateExtraDaysMiles(event, 'OneWay', '${daysAllowed}')">Save</button>
                                <button type="button" class="right cancel" onclick="CloseSecondaryPopup()">Cancel</button>
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

                    const DateBox = $("#daysPopupDatePicker")
                    let currentYear = new Date().getFullYear();
                    let nextYear = currentYear + 1;

                    let baseDate = new Date(getDate());
                    let minDate = new Date(baseDate.getTime() + (daysAllowed * 24 * 60 * 60 * 1000));

                    function updateChargeableDays() {
                        var selectedDate = DateBox.datepicker('getDate');
                        var minDate = DateBox.datepicker('option', 'minDate');
                        var extraDaysAllowedFree = parseInt($("#extraDaysAllowedFree").val(), 10) || 0;
                    
                        if (selectedDate && !isNaN(extraDaysAllowedFree)) {
                            var timeDiff = selectedDate - minDate;
                            var totalDaysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                            
                            var chargeableDays = Math.max(0, totalDaysDiff - extraDaysAllowedFree);
                            $("#additionalDaysAllowed").val(totalDaysDiff)
                            $('#extraDaysAllowedCharge').val(chargeableDays);
                        }
                    }
                    
                    // Event listener for changes in extraDaysAllowedFree
                    $("#extraDaysAllowedFree").on('change', updateChargeableDays);

                    DateBox.datepicker({
                        dateFormat: "mm/dd/yy",
                        minDate: minDate,
                        yearRange: `${currentYear}:${nextYear}`,
                        changeYear: false,
                        changeMonth: true,
                        onSelect: function (dateText) {
                            updateChargeableDays();
                        }
                    });        
                    
                    DateBox.datepicker('setDate', minDate);
                    updateChargeableDays();
                } else {
                    console.log("IT-Ref")
                    const hoursRequested = $("#hoursRequested").val()

                    const nMessagePopup = document.querySelector("#updateDaysMilesPopup")
                    nMessagePopup.innerHTML = `` // Reset Content

                    const Html_Content = `
                        <h2 class="header">Reservation Hours</h2>
    
                        <div class="dropoffcontent">
                            <div class="contactdetails">
                                <label>
                                    Hours Requested:
                                    <input data-val="true" data-val-number="The field DaysAllowed must be a number." data-val-regex="Please enter a positive whole number only" data-val-regex-pattern="(?:\d*)?\d+" data-val-required="The DaysAllowed field is required." id="hoursRequested" min="0" name="DaysAllowed" onkeypress="return IsNumberKey(event)" type="text" value="${hoursRequested}" aria-describedby="hoursRequested-error" class="valid" aria-invalid="false">
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
                                <button type="submit" class="right save" onclick="validateExtraDaysMiles(event, 'InTown', '${hoursRequested}')">Save</button>
                                <button type="button" class="right cancel" onclick="CloseSecondaryPopup()">Cancel</button>
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

                    const DateBox = $("#daysPopupDatePicker")
                    const DateHour = $("#daysPopupDateHour")
                    const DateAMPM = $("#daysPopupDateAMPM")
                    const formatIntoDate = new Date(getDate());
                    formatIntoDate.setTime(formatIntoDate.getTime() + (hoursRequested * 60 * 60 * 1000));

                    let currentYear = new Date().getFullYear();
                    let nextYear = currentYear + 1;

                    DateBox.datepicker({
                        dateFormat: "mm/dd/yy",
                        minDate: new Date(getDate()),
                        yearRange: `${currentYear}:${nextYear}`,
                        changeYear: false,
                        changeMonth: true,
                        onSelect: function (dateText) {
                            var selectedDate = $(this).datepicker('getDate');
                            var currentDateTime = new Date(getDate());

                            var hours = parseInt(DateHour.val(), 10);
                            var ampm = DateAMPM.val();

                            if (ampm === 'PM' && hours < 12) {
                                hours += 12;
                            } else if (ampm === 'AM' && hours === 12) {
                                hours = 0;
                            }

                            selectedDate.setHours(hours);
                            selectedDate.setMinutes(0);
                            var diffInMilliseconds = selectedDate - currentDateTime;
                            var diffInHours = diffInMilliseconds / (1000 * 60 * 60);

                            $("#hoursRequested").val(diffInHours);
                        }
                    });

                    function updateDateTime() {
                        var date = DateBox.datepicker('getDate');

                        if (!date) {
                            console.error('Date is null!');
                            return;
                        }

                        var hours = parseInt(DateHour.val(), 10);
                        var ampm = DateAMPM.val();

                        if (ampm === 'PM' && hours < 12) {
                            hours += 12;
                        } else if (ampm === 'AM' && hours === 12) {
                            hours = 0;
                        }

                        date.setHours(hours);
                        date.setMinutes(0);
                        DateBox.datepicker('setDate', date);

                        var currentDateTime = new Date(getDate());
                        var diffInMilliseconds = date - currentDateTime;
                        var diffInHours = diffInMilliseconds / (1000 * 60 * 60);
                        $("#hoursRequested").val(diffInHours);
                    }

                    DateHour.add(DateAMPM).on('change', updateDateTime);

                    $("#hoursRequested").on('change', function () {
                        var hours = parseInt($(this).val(), 10);
                        var referenceDate = new Date(getDate());

                        if (!isNaN(hours)) {
                            var updatedDate = new Date(referenceDate.getTime() + hours * 60 * 60 * 1000);

                            DateBox.datepicker('setDate', updatedDate);

                            var updatedHours = updatedDate.getHours();
                            var ampm = updatedHours >= 12 ? 'PM' : 'AM';
                            updatedHours = updatedHours % 12;
                            updatedHours = updatedHours ? updatedHours : 12;

                            DateHour.val(updatedHours);
                            DateAMPM.val(ampm);
                        }
                    });

                    function setInitialDateTime() {
                        var initialDateTime = new Date(getDate());
                        initialDateTime.setTime(initialDateTime.getTime() + (hoursRequested * 60 * 60 * 1000));

                        DateBox.datepicker('setDate', initialDateTime);

                        var initialHours = initialDateTime.getHours();
                        var initialAmPm = initialHours >= 12 ? 'PM' : 'AM';
                        initialHours = initialHours % 12;
                        initialHours = initialHours ? initialHours : 12;

                        DateHour.val(initialHours);
                        DateAMPM.val(initialAmPm);
                    }

                    setInitialDateTime();
                }
            }
        }
        DropoffPause = false
    }

    function continuouslyCheckTextSubmitFormVisibility() {
        function addScriptVersion(scriptName, version) {
            let scriptVersionElement = document.createElement('div');
            scriptVersionElement.style.display = 'none';
            scriptVersionElement.classList.add('script-version');
            scriptVersionElement.dataset.name = scriptName;
            scriptVersionElement.dataset.version = version;
            document.body.appendChild(scriptVersionElement);
        }

        addScriptVersion("Dropoff Buttons", "2")

        setInterval(() => {
            if (!DropoffPause && isDropoffPopupVisible()) {
                runWhenDropoffVisible();
            }
        }, 100);
    }

    continuouslyCheckTextSubmitFormVisibility();
})();
