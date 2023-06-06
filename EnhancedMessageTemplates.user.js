// ==UserScript==
// @name         [Functional] Custom Message Template
// @namespace    http://tampermonkey.net/
// @version      5.12.1154A
// @description  Custom template for message templates
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==
const MessageEnd = "U-Haul Co. Palm Bay, FL 561-638-9428";
const MessageTemplateVersion = "2"
function getDynamicValuesForTemplate(templateName) {
    function processName(name, capitalizeWords, lowercaseWords) {
        lowercaseWords = lowercaseWords || [];
        return name.split(" ").map((word) => {
            if (capitalizeWords.includes(word.toUpperCase())) {
                return word.toUpperCase();
            } else if (lowercaseWords.includes(word.toLowerCase())) {
                return word.toLowerCase();
            } else {
                if (word.includes('-')) {
                    return word.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('-');
                } else {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }
            }
        }).join(" ");
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",];
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",];
        const dayText = days[date.getDay()];
        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();

        return `${dayText}, ${month} ${day}, ${year}`;
    }

    function addOrdinalSuffix(number) {
        const remainderTen = number % 10;
        const remainderHundred = number % 100;

        if (remainderTen === 1 && remainderHundred !== 11) {
            return number + "st";
        }
        if (remainderTen === 2 && remainderHundred !== 12) {
            return number + "nd";
        }
        if (remainderTen === 3 && remainderHundred !== 13) {
            return number + "rd";
        }

        return number + "th";
    }

    function processAddress(pickupCityStateZip, pickupStreet) {
        const addressComponents = pickupCityStateZip.split(", ");
        const city = addressComponents[0].split(" ").map(word => processName(word, [], ['of', 'the'])).join(" "); // Use processWord function here
        const state = addressComponents[1].split(" ").join(" ");
        const zipcode = addressComponents[2].trim();
        return [pickupStreet, city, state, zipcode]; // Return an array
    }

    function findPhoneNumber(list) {
        const phoneLabels = ["Primary Phone:", "Primary Phone", "Phone:", "Phone",];
        let phoneLabel;

        let allElements = list;
        for (let i = 0; i < allElements.length; i++) {
            let element = allElements[i];
            if (phoneLabels.includes(element.innerText)) {
                phoneLabel = element;
                break;
            }
        }

        if (phoneLabel) {
            let phoneNumber = phoneLabel.nextElementSibling;
            if (phoneNumber) {
                return phoneNumber.innerText;
            }
        }
    }

    const capitalizeWords = ["LLC", "INC", "PSL"];
    const lowercaseWords = ["of", "the"];

    const reservationNumber = document.querySelector("#textDocumentNumber").value.trim();
    const customerName = processName(document.querySelector("#customerFirstNameOnly").value.trim(), [], []);
    const customerLastName = processName(document.querySelector("#ReservationPopup > section > header > h1").textContent.split("-")[1].trim(), [], []);
    const preferredPickupDateElements = document.querySelectorAll("#Contract_PreferredPickupDate");
    const rawPreferredPickupDate = Array.from(preferredPickupDateElements).find((element) => element.value).value;
    const formattedPreferredPickupDate = formatDate(rawPreferredPickupDate);
    const [dayText, month, dayNumber, year] = formattedPreferredPickupDate.split(/[\s,]+/);
    const dayPref = addOrdinalSuffix(dayNumber);
    const hour = document.querySelector("#Contract_PreferredPickupHour").value;
    const minute = document.querySelector("#Contract_PreferredPickupMinute").value.padStart(2, "0");
    const ampm = document.querySelector("#Contract_PreferredPickupAmPm").value
    const locationDetails = document.querySelector("#mapLocationDetails > div.row > div:nth-child(2) > dl");
    const ddElements = locationDetails.querySelectorAll("dd");
    const dtElements = locationDetails.querySelectorAll("dt");
    const pickupCityStateZip = ddElements[1].innerText.split("\n")[1].trim()
    const pickupStreet = ddElements[1].innerText.split("\n")[0].trim();
    const [street, city, state, zipcode] = processAddress(pickupCityStateZip, pickupStreet);
    const businessName = processName(ddElements[0].innerText, capitalizeWords, lowercaseWords);
    const phoneNumber = findPhoneNumber(dtElements);

    if (templateName === "High Demand" || templateName === "Low Availability ") {
        const fromCityValue = document.getElementById("FromCityValue");
        const text = fromCityValue.textContent.trim(); // Trim any leading/trailing spaces

        return {
            cxFirstName: customerName,
            cxLastName: customerLastName,
            resNumber: reservationNumber,
            pickupMonthNum: month,
            pickupDayNum: dayPref,
            pickupYear: year,
            pickupHour: hour,
            pickupMinute: minute,
            pickupDay: dayText,
            pAMPM: ampm,
            pickupCity: processName(text.split(",")[0].trim(), [], ['of', 'the']),
            pickupState: text.split(",")[1].trim().toUpperCase(),
            pickupStreet: street,
            pickupZipcode: zipcode,
            pickupBusinessName: businessName,
            pickupPhone: phoneNumber,
        };
    } else {
        return {
            cxFirstName: customerName,
            cxLastName: customerLastName,
            resNumber: reservationNumber,
            pickupMonthNum: month,
            pickupDayNum: dayPref,
            pickupYear: year,
            pickupHour: hour,
            pickupMinute: minute,
            pickupDay: dayText,
            pAMPM: ampm,
            pickupCity: city,
            pickupState: state,
            pickupStreet: street,
            pickupZipcode: zipcode,
            pickupBusinessName: businessName,
            pickupPhone: phoneNumber,
        }
    }
}

let CurrentSelector = "";
let MessageTemplateLastVisible = false;
const MessageTemplates = {
    "Storage Offer": {
        func: function(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
            return `CONGRATULATIONS, ${cxFirstName.toUpperCase()}!
As a special thank you for choosing U-Haul we are offering you 1 FREE MONTH OF STORAGE! We offer Drive up Storage, 24/7 Secured Inside Units & Climate Controlled Storage. NO DEPOSIT & Individually alarmed room
with 24-Hour Access & MORE! To take advantage of this offer contact 1-800-GO-UHAUL and use your reference number ${resNumber} and we will be able to assist you with getting a unit setup nearby ${city}!
We hope to hear from you soon and welcome to you ${city}, ${state}
${MessageEnd}`;
        },

        overrideOriginalMessage: true,

        shouldRun: function () {
            if (document.querySelector("#DispatchDate")) {
                return true
            }

            return false
        }
    },

    "E-Alert Notice": {
        func: function(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
            return `U-Haul Reservation: #${resNumber} : ${cxLastName}
Your reservation has been flagged due to a previous rental you might have had with U-Haul, this may result in unexpected issues for your reservation scheduled for ${Day}, ${MonthText} ${DayNumber}, ${Year} at ${Hour}:${Minute} ${pAMPM}.
We ask you contact U-Haul E-Alerts at (877) 653-0490 before the date of your reservation to avoid any unexpected issues.
${MessageEnd}`;
        },

        overrideOriginalMessage: true,

        shouldRun: function () {
            const eAlertContainer = document.querySelector('#eAlertNotesContainer');
            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate" && eAlertContainer && eAlertContainer.innerHTML.indexOf('e Alert') !== -1)) {
                return true
            }

            return false
        }
    },

    "24/7 Rental Notice": {
        func: function (cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
            return `U-Haul Reservation: #${resNumber} : ${cxLastName}
You are receiving this information as your reservation scheduled at ${businessName} will not be open during your scheduled pickup time for ${Day}, ${MonthText} ${DayNumber}, ${Year} at ${Hour}:${Minute} ${pAMPM}, you are receiving this information to assist you with such process.
Please use this link to learn more about the 24/7 Rental Process - http://uhaul.com/s/E4260B3676
Please use this link to download the U-Haul Mobile App - https://uhaul.com/s/6859554008
${MessageEnd}`;
        },

        overrideOriginalMessage: true,

        shouldRun: function () {
            const spanElement = document.querySelector('span.custom.checkbox.disabled');

            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate") && document.querySelector("#ReservationSummaryTab > div:nth-child(1) > div.medium-6.large-7.columns > label > span.custom.checkbox.checked") && spanElement && spanElement.classList.contains('checked')) {
                return true
            }

            return false
        }
    },

    "Equipment Change": {
        func: function(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
            return `loading...`;
        },

        overrideOriginalMessage: true,

        shouldRun: function () {
            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate")) {
                return true
            }

            return false
        }
    },

    "New Dropoff": {
        func: function(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
            return `loading...`;
        },

        overrideOriginalMessage: true,

        shouldRun: function () {
            if (document.querySelector("#DispatchDate")) {
                return true
            }

            return false
        }
    },

    "New Pickup": {
        func: function(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
            return `loading...`;
        },

        overrideOriginalMessage: true,

        shouldRun: function () {
            const spanElement = document.querySelector('span.custom.checkbox.disabled');
            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate") && spanElement && spanElement.classList.contains('checked')) {
                return true
            }

            return false
        }
    },

    "Late Pickup Notice": {
        func: function(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
            return `loading...`;
        },

        overrideOriginalMessage: true,

        shouldRun: function () {
            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate")) {
                return true
            }

            return false
        }
    },

    "Late Pickup Cancellation": {
        func: function(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
            return `loading...`;
        },

        overrideOriginalMessage: true,
        displayName: `Cancelation Notice`,

        shouldRun: function () {
            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate")) {
                return true
            }

            return false
        }
    },

    "Duplicate Reservation": {
        func: function() {
            return "nothing... Absolutely nothing should be here"
        },
        overrideOriginalMessage: true,

        shouldRun: function () {
            return false
        }
    },

    "Low Availability ": {
        func: function(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
            return `U-Haul Reservation: #${resNumber} : ${cxLastName}
We are contacting you to advise that we are experiencing delays with incoming equipment into your preferred city scheduled for ${Day}, ${MonthText} ${DayNumber}, ${Year} at ${Hour}:${Minute} ${pAMPM} located in ${city}, ${state}.
You are receiving this notice informing you that you will need to reschedule your reservation for a different size of equipment and/or a different date/time.
We appreciate your patience and hope to hear from you soon to discuss alternative availability.
${MessageEnd}`;
        },
        overrideOriginalMessage: true,

        shouldRun: function () {
            const spanElement = document.querySelector('span.custom.checkbox.disabled');
            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate") && spanElement && !spanElement.classList.contains('checked')) {
                return true
            }

            return false
        }
    },

    "High Demand": {
        func: function HighDemandMessage(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
            return `loading...`;
        },
        overrideOriginalMessage: true,

        shouldRun: function () {
            const spanElement = document.querySelector('span.custom.checkbox.disabled');
            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate") && spanElement && !spanElement.classList.contains('checked')) {
                return true
            }

            return false
        }
    },

    "Not Covered": {
        func: function(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
            return `U-Haul Reservation: #${resNumber} : ${cxLastName}
Unfortunately, your equipment is no longer available for pickup today at your current assigned pickup location. We apologize for any inconveniences they may occur to your move, please wait 30 Minutes - 1 Hour to receive a follow-up text or phone call for your pickup information.
If you don't receive any further updates within 3 hours of receiving this message please contact (561) 638-9428, if you need your equipment at your requested scheduled time please contact us for assistance getting a new pickup location.
We do greatly apologize for any inconveniences this may cause for you, if you have any questions or have already made other arrangements, please call U-Haul Regional Scheduling Office.
${MessageEnd}`;
        },

        overrideOriginalMessage: true,

        shouldRun: function () {
            const spanElement = document.querySelector('span.custom.checkbox.disabled');
            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate")) {
                return true
            }

            return false
        }
    },
};

function isMessageTextForumVisible() {
    const textSubmitForm = document.querySelector("#textMessageArea");
    if (
        textSubmitForm &&
        textSubmitForm.offsetWidth > 0 &&
        textSubmitForm.offsetHeight > 0
    ) {
        return true;
    }
    MessageTemplateLastVisible = false;
    return false;
}

function createAndInsertDropdown(id, label, options, defaultOption) {
    const container = document.createElement("div");
    container.className = "columns";

    const labelElement = document.createElement("label");
    labelElement.textContent = label;
    container.appendChild(labelElement);

    const select = document.createElement("select");
    select.id = id;
    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.text;

        // Add 'selected' attribute if this option is the default
        if (option.value === defaultOption) {
            optionElement.selected = true;
        }

        select.appendChild(optionElement);
    });
    container.appendChild(select);

    return container;
}

function MessageTextForumVisible() {
    if (MessageTemplateLastVisible === false) {
        MessageTemplateLastVisible = true;

        // Fix Whitespace in message
        const AddTemplateButton = document.querySelector('#textSubmitForm > div > div > div > div:nth-child(1) > div:nth-child(2) > div.medium-4.columns > input');

        if (AddTemplateButton) {
            AddTemplateButton.addEventListener("click", function() {
                const textarea = document.getElementById('textMessageArea');
                if (textarea) {
                    textarea.value = textarea.value.trim();
                } else {
                    console.error('Textarea not found');
                }
            });
        }

        const phoneNumberInput = document.querySelector("#CustomerPhoneNumber");

        function formatPhoneNumber(inputElement) {
            let value = inputElement.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10); // Limit to 10 numerical characters

            let formattedValue = '';
            if (value.length > 0) formattedValue += '(' + value.slice(0, 3);
            if (value.length > 3) formattedValue += ') ' + value.slice(3, 6);
            if (value.length > 6) formattedValue += '-' + value.slice(6);
            inputElement.value = formattedValue;
        }

        phoneNumberInput.addEventListener('input', function () {
            formatPhoneNumber(this);
        });

        formatPhoneNumber(phoneNumberInput);

        function stringToBoolean(string) {
            switch(string.toLowerCase().trim()){
                case "true": return true;
                case "false": return false;
                default: return Boolean(string);
            }
        }

        function updateMessage() {
            // EQUIPMENT CHANGE
            if (CurrentSelector == "Equipment Change") {
                const newEquip1 = document.querySelector("#newEquip");
                const oldEquip1 = document.querySelector("#oldEquip");
                const availabilityIssueDropdown = document.querySelector("#availabilityIssueDropdown");
                const locationChangedDropdown = document.querySelector("#locationChangedDropdown");

                if (newEquip1 && oldEquip1 && availabilityIssueDropdown && locationChangedDropdown) {
                    let NewMsg = "";
                    const dynamicValues = getDynamicValuesForTemplate(CurrentSelector);
                    const newEquip = newEquip1.options[newEquip1.selectedIndex].textContent.split(" - ")[1];
                    const oldEquip = oldEquip1.options[oldEquip1.selectedIndex].textContent.split(" - ")[1];
                    const availabilityIssue = stringToBoolean(availabilityIssueDropdown.options[availabilityIssueDropdown.selectedIndex].text)
                    const locationChanged = stringToBoolean(locationChangedDropdown.options[locationChangedDropdown.selectedIndex].text)

                    NewMsg = `U-Haul Reservation; Equipment Change : #${dynamicValues.resNumber} : ${dynamicValues.cxFirstName} ${dynamicValues.cxLastName}
The equipment you reserved equipment has been updated. ${availabilityIssue && locationChanged ? 'Due to changes in availability at your assigned location, your' : (availabilityIssue ? 'Due to availability issues at your assigned location, your' : 'Your') || (locationChanged ? 'Because of scheduling changes at your assigned location, your' : 'Your')} equipment has been changed from "${oldEquip}" to "${newEquip}". If you have other equipment reserved, these changes will not appear in this message. Please check your reservation on https://www.uhaul.com/Auth/OrderLookUp/ for complete details.
${MessageEnd}`;

                    if (document.getElementById(`${CurrentSelector}:DynamicTemplate`)) {
                        const HiddenMsg = document.getElementById(`${CurrentSelector}:DynamicTemplate`)
                        HiddenMsg.value = NewMsg
                    }
                }
            }





            // NEW PICKUP
            if (CurrentSelector == "New Pickup") {
                const styleDropdown = document.querySelector("#styleDropdown");
                const wasPickupUpdatedDropdown = document.querySelector("#wasPickupUpdatedDropdown");

                if (styleDropdown && wasPickupUpdatedDropdown) {
                    let NewMsg = "";
                    const dynamicValues = getDynamicValuesForTemplate(CurrentSelector);
                    const style = styleDropdown.options[styleDropdown.selectedIndex].value;
                    const wasPickupUpdated = stringToBoolean(wasPickupUpdatedDropdown.options[wasPickupUpdatedDropdown.selectedIndex].text);

                    if (style === "1") {
                        NewMsg = `U-Haul Reservation; New Pickup : #${dynamicValues.resNumber} : ${dynamicValues.cxFirstName} ${dynamicValues.cxLastName}
${wasPickupUpdated ? 'Your pick-up location has been updated! You can find your equipment available to pick up at' : 'Your reservation is scheduled to be picked up at'} ${dynamicValues.pickupBusinessName}, ${dynamicValues.pickupStreet}, ${dynamicValues.pickupCity} ${dynamicValues.pickupState} ${dynamicValues.pickupZipcode} on ${dynamicValues.pickupDay}, ${dynamicValues.pickupMonthNum} ${dynamicValues.pickupDayNum}, ${dynamicValues.pickupYear} at ${dynamicValues.pickupHour}:${dynamicValues.pickupMinute} ${dynamicValues.pAMPM}.
If you have any questions regarding this location, you can call them at ${dynamicValues.pickupPhone} or contact our office directly using the number below.
${MessageEnd}`;
                    } else if (style === "2") {
                        NewMsg = `U-Haul Reservation; New Pickup : #${dynamicValues.resNumber} : ${dynamicValues.cxFirstName} ${dynamicValues.cxLastName}
We're sorry for the inconvenience, but due to equipment availability at this time, your pickup location has been changed. Your equipment will be ready for pick-up at ${dynamicValues.pickupBusinessName}, ${dynamicValues.pickupStreet}, ${dynamicValues.pickupCity} ${dynamicValues.pickupState} ${dynamicValues.pickupZipcode} on ${dynamicValues.pickupDay}, ${dynamicValues.pickupMonthNum} ${dynamicValues.pickupDayNum}, ${dynamicValues.pickupYear} at ${dynamicValues.pickupHour}:${dynamicValues.pickupMinute} ${dynamicValues.pAMPM}.
We apologize for any disruptions this may cause. If have any questions regarding this location you can reach them at ${dynamicValues.pickupPhone} or if you are interested in alternative equipment sizes, wish to reschedule, please contact our office directly using the number below.
${MessageEnd}`;
                    }

                    if (document.getElementById(`${CurrentSelector}:DynamicTemplate`)) {
                        const HiddenMsg = document.getElementById(`${CurrentSelector}:DynamicTemplate`)
                        HiddenMsg.value = NewMsg
                    }
                }
            }





            // NEW DROPOFF
            if (CurrentSelector == "New Dropoff") {
                const styleDropdown = document.querySelector("#styleDropdown");
                if (styleDropdown) {
                    let NewMsg = "";
                    const dynamicValues = getDynamicValuesForTemplate(CurrentSelector);
                    const style = styleDropdown.options[styleDropdown.selectedIndex].value;

                    if (style === "1") {
                        NewMsg = `U-Haul Reservation: #${dynamicValues.resNumber} : ${dynamicValues.cxLastName}
Your dropoff has been updated! You can return your equipment to ${dynamicValues.pickupBusinessName}, ${dynamicValues.pickupStreet}, ${dynamicValues.pickupState} ${dynamicValues.pickupZipcode}.
If you have any questions or concerns regarding your new dropoff location, please call U-Haul Regional Scheduling Office.
${MessageEnd}`;
                    } else if (style === "2") {
                        NewMsg = `U-Haul Reservation: #${dynamicValues.resNumber} : ${dynamicValues.cxLastName}
Unfortunately, your dropoff location has been rescheduled to the nearest location that is able to receive your equipment. You will be able to return your equipment to ${dynamicValues.pickupBusinessName}, ${dynamicValues.pickupStreet}, ${dynamicValues.pickupState} ${dynamicValues.pickupZipcode}.
We apologize for any inconveniences this may cause for you, if you have any questions, please call U-Haul Regional Scheduling Office.
${MessageEnd}`;
                    }

                    if (document.getElementById(`${CurrentSelector}:DynamicTemplate`)) {
                        const HiddenMsg = document.getElementById(`${CurrentSelector}:DynamicTemplate`)
                        HiddenMsg.value = NewMsg
                    }
                }
            }





            // LATE PICKUP NOTICE
            if (CurrentSelector == "Late Pickup Notice") {
                const isEquipAvailDropdown = document.querySelector("#availDropdown");

                if (isEquipAvailDropdown) {
                    const Dropdown = isEquipAvailDropdown.options[isEquipAvailDropdown.selectedIndex].text;
                    const isAvail = stringToBoolean(Dropdown);
                    let NewMsg = "";
                    const dynamicValues = getDynamicValuesForTemplate(CurrentSelector);

                    NewMsg = `U-Haul Reservation; Late Notice : Reservation #${dynamicValues.resNumber} : ${dynamicValues.cxFirstName} ${dynamicValues.cxLastName}
Our records indicate your rental has not yet been started and may be at risk of cancellation. ${isAvail ? '' : 'Unfortunately, the equipment you reserved is no longer available at your current location.'}
This notice is in regard to your reservation at ${dynamicValues.pickupBusinessName} in ${dynamicValues.pickupCity}, ${dynamicValues.pickupState} ${dynamicValues.pickupZipcode}.
If you have already started a rental or wish to reschedule for a later date/time, please reach us using the phone number below.
${MessageEnd}`;

                    if (document.getElementById(`${CurrentSelector}:DynamicTemplate`)) {
                        const HiddenMsg = document.getElementById(`${CurrentSelector}:DynamicTemplate`)
                        HiddenMsg.value = NewMsg
                    }
                }
            }





            // CANCELATION NOTICE
            if (CurrentSelector == "Cancelation Notice") {
                const styleDropdown = document.querySelector("#styleDropdown");
                if (styleDropdown) {
                    let NewMsg = "";
                    const dynamicValues = getDynamicValuesForTemplate(CurrentSelector);
                    const style = styleDropdown.options[styleDropdown.selectedIndex].value;

                    if (style === "1") {
                        NewMsg = `U-Haul Reservation; Cancelation Notice : Reservation #${dynamicValues.resNumber} : ${dynamicValues.cxFirstName} ${dynamicValues.cxLastName}
Your U-Haul Reservation was recently canceled, this reservation was scheduled for ${dynamicValues.pickupBusinessName} in ${dynamicValues.pickupCity}, ${dynamicValues.pickupState} ${dynamicValues.pickupZipcode}.
We hope to see you back soon! If you change your mind in the near future, you can call us at the number below to make new arrangements.
${MessageEnd}`;
                    } else if (style === "2") {
                        NewMsg = `U-Haul Reservation; Cancelation Notice : Reservation #${dynamicValues.resNumber} : ${dynamicValues.cxFirstName} ${dynamicValues.cxLastName}
We hope we didn't miss your arrival, our records indicate the reservation has not yet been picked up. In result your reservation at ${dynamicValues.pickupBusinessName} in ${dynamicValues.pickupCity}, ${dynamicValues.pickupState} has automatically been canceled.
If you believe this was a mistake & you are still in-need of this equipment, you can call us at the number below to make new arrangements.
${MessageEnd}`;
                    } else if (style === "3") {
                        NewMsg = `U-Haul Reservation; Cancelation Notice : Reservation #${dynamicValues.resNumber} : ${dynamicValues.cxFirstName} ${dynamicValues.cxLastName}
Your U-Haul Reservation was recently canceled, this reservation was scheduled for ${dynamicValues.pickupBusinessName} in ${dynamicValues.pickupCity}, ${dynamicValues.pickupState} ${dynamicValues.pickupZipcode}.
Our records indicate multiple reservations were created. In result, reservation ${dynamicValues.resNumber} has been canceled. If you believe this was a mistake & you are in need of multiple equipment of the same class, you can call us at the number below to make new arrangements.
${MessageEnd}`;
                    }

                    if (document.getElementById(`${CurrentSelector}:DynamicTemplate`)) {
                        const HiddenMsg = document.getElementById(`${CurrentSelector}:DynamicTemplate`)
                        HiddenMsg.value = NewMsg
                    }
                }
            }





            // HIGH DEMAND
            if (CurrentSelector == "High Demand") {
                let NewMsg = "";
                const dynamicValues = getDynamicValuesForTemplate(CurrentSelector);

                NewMsg = `U-Haul Reservation; High Demand Notice: #${dynamicValues.resNumber} : ${dynamicValues.cxFirstName} ${dynamicValues.cxLastName}
You are receiving this notice as we are experiencing a high volume of incoming reservations into ${dynamicValues.pickupCity}, ${dynamicValues.pickupState}.
We ask you to reach out to us at your earliest availability. We would like to collect more information on what flexibility you have with the Date/Time, Distance, and Equipment Size.
If we aren't able to confirm these details prior to ${dynamicValues.pickupMonthNum} ${dynamicValues.pickupDayNum}, ${dynamicValues.pickupYear} unwanted changes may be made during the scheduling process.
As a reminder, the model, date, and location that you are choosing is a preference and further changes may need to be made to accommodate your reservation.
${MessageEnd}`;
                if (document.getElementById(`${CurrentSelector}:DynamicTemplate`)) {
                    const HiddenMsg = document.getElementById(`${CurrentSelector}:DynamicTemplate`)
                    HiddenMsg.value = NewMsg
                }
            }
        }

        function handleTemplateDropdownChange(event) {
            const actualDropdown = document.querySelector("#textSubmitForm > div > div > div > div:nth-child(1) > div:nth-child(2) > div.medium-8.columns > label > div"); // Get the actual dropdown element
            const selectedOptionValue = actualDropdown.querySelector(".selected").textContent; // Get the text content of the selected option

            const extraDropdownsContainer = document.querySelector("#extraDropdownsContainer");
            extraDropdownsContainer.innerHTML = ""; // Clear any existing extra dropdowns

            CurrentSelector = selectedOptionValue.trim()
            if (selectedOptionValue.trim() === "Equipment Change") {
                const EquipList = [
                    { value: "BE", text: "BE - Cargo Van"},
                    { value: "BP", text: "BP - Pickup Truck"},
                    { value: "MP", text: "MP - Ford Maverick Pickup Truck"},
                    { value: "TM", text: "TM - 10' Box Truck"},
                    { value: "DC", text: "DC - 15' Box Truck"},
                    { value: "EL", text: "EL - 17' Box Truck"},
                    { value: "TT", text: "TT - 20' Box Truck"},
                    { value: "JH", text: "JH - 26' Box Truck"},
                    { value: "FS", text: "FS - 4' X 7' Open Trailer"},
                    { value: "AO", text: "AO - 5' X 8' Open Trailer"},
                    { value: "RO", text: "RO - 6' X 12' Open Trailer"},
                    { value: "HO", text: "HO - 6' X 12' Open Trailer w/Ramp"},
                    { value: "UV", text: "UV - 4' X 8' Enclosed Trailer"},
                    { value: "AV", text: "AV - 5' X 8' Enclosed Trailer"},
                    { value: "RV", text: "RV - 6' X 12' Enclosed Trailer"},
                    { value: "RT", text: "RT - 5' X 9' Open Trailer w/Ramp"},
                    { value: "MT", text: "MT - Motorcycle Trailer"},
                    { value: "TD", text: "TD - Tow Dolly"},
                    { value: "AT", text: "AT - Auto Transport"},
                    { value: "AA", text: "AA - Wooden U-Box"},
                    { value: "AB", text: "AB - Plastic U-Box"},
                ];

                const BooleanValues = [
                    { value: "1", text: "True"},
                    { value: "2", text: "False"},
                ];

                const oldEquip = createAndInsertDropdown("oldEquip", "Old Equipment:", EquipList);
                const newEquip = createAndInsertDropdown("newEquip", "New Equipment:", EquipList);
                const availabilityIssueDropdown = createAndInsertDropdown("availabilityIssueDropdown", "Availability Change:", BooleanValues, "2");
                const locationChangedDropdown = createAndInsertDropdown("locationChangedDropdown", "Location Change:", BooleanValues, "2");

                extraDropdownsContainer.appendChild(oldEquip);
                extraDropdownsContainer.appendChild(newEquip);
                extraDropdownsContainer.appendChild(availabilityIssueDropdown);
                extraDropdownsContainer.appendChild(locationChangedDropdown);

                oldEquip.addEventListener("change", updateMessage);
                newEquip.addEventListener("change", updateMessage);
                availabilityIssueDropdown.addEventListener("change", updateMessage);
                locationChangedDropdown.addEventListener("change", updateMessage);

                updateMessage();
            }

            if (selectedOptionValue.trim() === "New Pickup") {
                const styleOptions = [
                    { value: "1", text: "Regular"},
                    { value: "2", text: "Lacks Availability"},
                ];

                const wasPickupUpdated = [
                    { value: "1", text: "True"},
                    { value: "2", text: "False"},
                ];

                const wasPickupUpdatedDropdown = createAndInsertDropdown("wasPickupUpdatedDropdown", "Pickup Updated:", wasPickupUpdated);
                const styleDropdown = createAndInsertDropdown("styleDropdown", "Message Style:", styleOptions);

                extraDropdownsContainer.appendChild(styleDropdown);
                extraDropdownsContainer.appendChild(wasPickupUpdatedDropdown);

                styleDropdown.addEventListener("change", updateMessage);
                wasPickupUpdatedDropdown.addEventListener("change", updateMessage);

                updateMessage();
            }

            if (selectedOptionValue.trim() === "New Dropoff") {
                const styleOptions = [
                    { value: "1", text: "Regular"},
                    { value: "2", text: "Lacks Availability"},
                ];

                const styleDropdown = createAndInsertDropdown("styleDropdown", "Message Style:", styleOptions);

                extraDropdownsContainer.appendChild(styleDropdown);

                styleDropdown.addEventListener("change", updateMessage);

                updateMessage();
            }

            if (selectedOptionValue.trim() === "Late Pickup Notice") {
                const isAvail = [
                    { value: "1", text: "True"},
                    { value: "2", text: "False"},
                ];

                const availDropdown = createAndInsertDropdown("availDropdown", "Is Equipment Available?", isAvail);

                extraDropdownsContainer.appendChild(availDropdown);

                availDropdown.addEventListener("change", updateMessage);

                updateMessage();
            }

            if (selectedOptionValue.trim() === "Cancelation Notice") {
                const cancelReasons = [
                    { value: "1", text: "Confirmation"},
                    { value: "2", text: "No Call/No Show"},
                    { value: "3", text: "Duplicate"},
                ];

                const cancelDropdown = createAndInsertDropdown("styleDropdown", "Cancelation Reason", cancelReasons);

                extraDropdownsContainer.appendChild(cancelDropdown);

                cancelDropdown.addEventListener("change", updateMessage);

                updateMessage();
            }

            if (selectedOptionValue.trim() === "High Demand") {
                //                 const rentalType = [
                //                     { value: "1", text: "#2 - No Triangle"},
                //                     { value: "2", text: "#3 - Yellow Triangle"},
                //                     { value: "3", text: "#4 - Red Triangle"},
                //                 ];

                //                 const rentalTypeDropdown = createAndInsertDropdown("styleDropdown", "Rental Type", rentalType);
                //                 extraDropdownsContainer.appendChild(rentalTypeDropdown);

                //                 // Add event listeners to the additional dropdowns to update the message when their values change
                //                 rentalTypeDropdown.addEventListener("change", updateMessage);

                //                 // Update the message initially based on the default selected values
                updateMessage();
            }
        }

        // Add an event listener to the main message template dropdown
        const templateDropdown = document.querySelector("#customCustomerContactTemplateDropDown");
        templateDropdown.addEventListener("change", handleTemplateDropdownChange);

        // Create a container for the additional dropdowns
        const extraDropdownsContainer = document.createElement("div");
        extraDropdownsContainer.id = "extraDropdownsContainer";
        templateDropdown.parentElement.parentElement.appendChild(extraDropdownsContainer);

        const ulElement = document.querySelector("#textSubmitForm > div > div > div > div:nth-child(1) > div:nth-child(2) > div.medium-8.columns > label > div > ul");
        const dropdown = document.querySelector("#customCustomerContactTemplateDropDown");
        const imageSrc = "https://cdn.discordapp.com/attachments/962895897434394674/1090722644254535760/DynamicMessageColorSlightlyThicker.png"; // Replace with your image URL

        for (const key in MessageTemplates) {
            const existingLi = Array.from(ulElement.children).find((li) => li.textContent === key);
            const liElement = document.createElement("li");
            liElement.textContent = `${MessageTemplates[key].displayName || key}`;
            liElement.innerHTML = `<img src="${imageSrc}" alt="Dynamic" width="16" height="16" style="vertical-align: middle; margin-right: 5px;"> <span style="color: #2A517C;">${MessageTemplates[key].displayName || key}</span>`;

            const dynamicValues = getDynamicValuesForTemplate(key);
            const formattedMessage = MessageTemplates[key].func(dynamicValues.cxFirstName, dynamicValues.cxLastName, dynamicValues.resNumber, dynamicValues.pickupMonthNum, dynamicValues.pickupDayNum, dynamicValues.pickupYear, dynamicValues.pickupHour, dynamicValues.pickupMinute, dynamicValues.pickupDay, dynamicValues.pAMPM, dynamicValues.pickupCity, dynamicValues.pickupState, dynamicValues.pickupStreet, dynamicValues.pickupZipcode, dynamicValues.pickupBusinessName, dynamicValues.pickupPhone);

            const optionElement = new Option(key, MessageTemplates[key].value || key);
            optionElement.value = formattedMessage;
            optionElement.id = `${MessageTemplates[key].displayName || key}:DynamicTemplate`
            optionElement.innerHTML = `<img src="${imageSrc}" alt="Dynamic" width="16" height="16" style="vertical-align: middle; margin-right: 5px;"> <span style="color: #2A517C;">${MessageTemplates[key].displayName || key}</span>`;

            function updateCurrentAnchorText() {
                const list = document.querySelector("#textSubmitForm ul");
                const currentAnchor = document.querySelector("#textSubmitForm .current");

                if (list && currentAnchor) {
                    const firstListItem = list.querySelector("li:first-child");

                    if (firstListItem) {
                        firstListItem.click()
                        firstListItem.classList.add("selected"); // Add the "selected" class to the first list item
                        const firstListItemText = firstListItem.textContent;
                        currentAnchor.textContent = firstListItemText;
                    }
                }
            }

            if (MessageTemplates[key].shouldRun() === true) {
                if (MessageTemplates[key].overrideOriginalMessage) {
                    if (existingLi) {
                        const index = Array.from(ulElement.children).indexOf(existingLi);
                        ulElement.removeChild(existingLi);
                        ulElement.insertBefore(liElement, ulElement.children[index])
                        const existingOption = Array.from(dropdown.children).find((option) => option.textContent === key);
                        dropdown.removeChild(existingOption);
                        dropdown.insertBefore(optionElement, dropdown.children[index]);
                    } else {
                        ulElement.appendChild(liElement);
                        dropdown.appendChild(optionElement);
                    }
                } else {
                    if (existingLi) {
                        const index = Array.from(ulElement.children).indexOf(existingLi);
                        ulElement.insertBefore(liElement, ulElement.children[index + 1]);
                        dropdown.insertBefore(optionElement, dropdown.children[index + 1]);
                    } else {
                        ulElement.appendChild(liElement);
                        dropdown.appendChild(optionElement);
                    }
                }
            } else {
                if (MessageTemplates[key].overrideOriginalMessage) {
                    if (existingLi) {
                        const existingOption = Array.from(dropdown.children).find((option) => option.textContent === key);
                        ulElement.removeChild(existingLi);
                        dropdown.removeChild(existingOption);
                    }
                }
            }
            updateCurrentAnchorText()
        }
    }
}

// Function to continuously check if the textSubmitForm is visible
function isMessageTextForumVisibleInterval() {
    function addScriptVersion(scriptName, version) {
        let scriptVersionElement = document.createElement('div');
        scriptVersionElement.style.display = 'none'; // Make it hidden
        scriptVersionElement.classList.add('script-version'); // So we can find it later
        scriptVersionElement.dataset.name = scriptName; // Store the script name
        scriptVersionElement.dataset.version = version; // Store the version
        document.body.appendChild(scriptVersionElement);
    }

    addScriptVersion("Dynamic Messages", MessageTemplateVersion)

    setInterval(() => {
        if (isMessageTextForumVisible()) {
            MessageTextForumVisible();
        } else {
            CurrentSelector = "";
        }
    }, 100); // Check every 100ms
}

isMessageTextForumVisibleInterval();
