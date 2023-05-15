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
console.log("Started [Dynamic Message Templates]")

const MessageEnd = "U-Haul Co. Palm Bay, FL 561-638-9428";
function GetEquipmentNameFromId(equipId) {
    const equipmentMap = {
        "BE": "Cargo Van",
        "BP": "Pickup Truck",
        "MP": "Ford Maverick Pickup Truck",
        "TM": "10' Box Truck",
        "DC": "15' Box Truck",
        "EL": "17' Box Truck",
        "TT": "20' Box Truck",
        "JH": "26' Box Truck",

        "FS": "4' X 7' Open Trailer",
        "AO": "5' X 8' Open Trailer",
        "RO": "6' X 12' Open Trailer",
        "HO": "6' X 12' Open Trailer w/Ramp",
        "UV": "4' X 8' Enclosed Trailer",
        "AV": "5' X 8' Enclosed Trailer",
        "RV": "6' X 12' Enclosed Trailer",
        "RT": "5' X 9' Open Trailer w/Ramp",
        "MT": "Motorcycle Trailer",
        "TD": "Tow Dolly",
        "AT": "Auto Transport",

        "AA": "Wooden U-Box",
        "AB": "Plastic U-Box",
    };

    if (equipId) {
        // remove any non-alphabetic characters from the input string
        equipId = equipId.replace(/[^A-Za-z]/g, '');

        // search for the given string in the equipment IDs and return the corresponding equipment name
        for (const [id, name] of Object.entries(equipmentMap)) {
            // remove any non-alphabetic characters from the ID string
            const cleanedId = id.replace(/[^A-Za-z]/g, '');

            if (cleanedId.includes(equipId)) {
                return name;
            }
        }
    }

    // return null if no matching equipment name is found
    return equipId;
}

function StorageOfferMessage(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
    return `CONGRATULATIONS, ${cxFirstName.toUpperCase()}!
As a special thank you for choosing U-Haul we are offering you 1 FREE MONTH OF STORAGE! We offer Drive up Storage, 24/7 Secured Inside Units & Climate Controlled Storage. NO DEPOSIT & Individually alarmed room
with 24-Hour Access & MORE! To take advantage of this offer contact 1-800-GO-UHAUL and use your reference number ${resNumber} and we will be able to assist you with getting a unit setup nearby ${city}!
We hope to hear from you soon and welcome to you ${city}, ${state}
${MessageEnd}`;
}

function EAlertNotice(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
    return `U-Haul Reservation: #${resNumber} : ${cxLastName}
Your reservation has been flagged due to a previous rental you might have had with U-Haul, this may result in unexpected issues for your reservation scheduled for ${Day}, ${MonthText} ${DayNumber}, ${Year} at ${Hour}:${Minute} ${pAMPM}.
We ask you contact U-Haul E-Alerts at (877) 653-0490 before the date of your reservation to avoid any unexpected issues.
${MessageEnd}`;
}

function MobilePickupRental(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
    return `U-Haul Reservation: #${resNumber} : ${cxLastName}
You are receiving this information as your reservation scheduled at ${businessName} will not be open during your scheduled pickup time for ${Day}, ${MonthText} ${DayNumber}, ${Year} at ${Hour}:${Minute} ${pAMPM}, you are receiving this information to assist you with such process.
Please use this link to learn more about the 24/7 Rental Process - http://uhaul.com/s/E4260B3676
Please use this link to download the U-Haul Mobile App - https://uhaul.com/s/6859554008
${MessageEnd}`;
}

function EquipChange(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
    return `loading...`;
}

function LatePickupNoticeMessage(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
    return `U-Haul Reservation: #${resNumber} : ${cxLastName}
Your reservation is at risk of cancelation; Reservation Scheduled for ${businessName} in ${city}, ${state} ${zipcode} on ${Day}, ${MonthText} ${DayNumber}, ${Year} at ${Hour}:${Minute} ${pAMPM}.
Has not yet been picked up and is at risk of being canceled. If you already picked up this equipment or need to reschedule, please call U-Haul Regional Scheduling Office.
${MessageEnd}`;
}

function LatePickupCancellationMessage(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
    return `loading...`;
}

function LowAvailabilityMessage(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
    return `U-Haul Reservation: #${resNumber} : ${cxLastName}
We are contacting you to advise that we are experiencing delays with incoming equipment into your preferred city scheduled for ${Day}, ${MonthText} ${DayNumber}, ${Year} at ${Hour}:${Minute} ${pAMPM} located in ${city}, ${state}.
You are receiving this notice informing you that you will need to reschedule your reservation for a different size of equipment and/or a different date/time.
We appreciate your patience and hope to hear from you soon to discuss alternative availability.
${MessageEnd}`;
}

function HighDemandMessage(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
    return `U-Haul Reservation: #${resNumber} : ${cxLastName}
We are contacting you to advise that we are experiencing delays with incoming equipment into your preferred city scheduled for ${Day}, ${MonthText} ${DayNumber}, ${Year} at ${Hour}:${Minute} ${pAMPM} located in ${city}, ${state}.
You will be receiving your pickup details 48 hours prior to your pickup location, we ask you keep an eye out for any text messages or emails sent from U-Haul.
If you do not receive your information via Text, Email, or Phone the day before your pickup we ask you contact our office at (561) 638-9428. If you have any questions or concerns regarding the reservation don't hesitate to contact us.
We thank you for choosing U-Haul and thank you for your understanding.
${MessageEnd}`;
}

function NewPickupMessage(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
    return `loading...`;
}

function NewDropoffMessage(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
    return `U-Haul Reservation: #${resNumber} : ${cxLastName}
Unfortunately, your drop has been changed to the nearest location accepting your size equipment. You can drop your equipment off at ${businessName}, ${street}, ${state} ${zipcode} on ${Day}, ${MonthText} ${DayNumber}, ${Year} at ${Hour}:${Minute} ${pAMPM}.
We apologize for any inconveniences this may cause for you, if you have any questions or have already returned your U-Haul Equipment, please call U-Haul Regional Scheduling Office.
${MessageEnd}`;
}

function NoAssignedLocation(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
    return `U-Haul Reservation: #${resNumber} : ${cxLastName}
Unfortunately, your equipment is no longer available for pickup today at your current assigned pickup location. We apologize for any inconveniences they may occur to your move, please wait 30 Minutes - 1 Hour to receive a follow-up text or phone call for your pickup information.
If you don't receive any further updates within 3 hours of receiving this message please contact (561) 638-9428, if you need your equipment at your requested scheduled time please contact us for assistance getting a new pickup location.
We do greatly apologize for any inconveniences this may cause for you, if you have any questions or have already made other arrangements, please call U-Haul Regional Scheduling Office.
${MessageEnd}`;
}

function TestingMessage(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
    return `Customer Name: ${cxFirstName}
Reservation Number: ${resNumber}
Pickup Month: ${MonthText}
Pickup Day: ${DayNumber}
Pickup Year: ${Year}
Pickup Hour: ${Hour}
Pickup Minute: ${Minute}
Pickup Day (Text): ${Day}
Pickup Am/Pm: ${pAMPM}
City: ${city}
State: ${state}
Street: ${street}
Zipcode: ${zipcode}
Busines Name: ${businessName}
Business Phone: ${phone}`;
}

function CancelationMessage(cxFirstName, cxLastName, resNumber, MonthText, DayNumber, Year, Hour, Minute, Day, pAMPM, city, state, street, zipcode, businessName, phone) {
    return `loading`
}

function getDynamicValuesForTemplate(templateName) {
    function processWord(word, capitalizeWords, lowercaseWords) {
        if (capitalizeWords.includes(word)) {
            return word;
        } else if (lowercaseWords.includes(word)) {
            return word.toLowerCase();
        } else {
            return word.replace(/([a-z])([A-Z])/g, (_, a, b) => a.toUpperCase() + '-' + b.toUpperCase());
        }
    }

    function processBusinessName(name, capitalizeWords, lowercaseWords) {
        lowercaseWords = lowercaseWords || [];
        return name.split(" ").map((word) => processWord(word, capitalizeWords, lowercaseWords)).join(" ");
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
        const city = addressComponents[0].split(" ").map(word => processWord(word, [], ['of', 'the'])).join(" "); // Use processWord function here
        const state = addressComponents[1].split(" ").join(" ");
        const zipcode = addressComponents[2].trim();
        return [pickupStreet, city, state, zipcode]; // Return an array
    }

    function findPhoneNumber(list) {
        const phoneLabels = [
            "Primary Phone:",
            "Primary Phone",
            "Phone:",
            "Phone",
        ];
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

    const reservationNumber = document.querySelector("#textDocumentNumber").value.trim();
    const customerName = processWord(document.querySelector("#customerFirstNameOnly").value.trim(), [], []);
    const customerLastName = processWord(document.querySelector("#ReservationPopup > section > header > h1").textContent.split("-")[1].trim(), [], []);
    const preferredPickupDateElements = document.querySelectorAll("#Contract_PreferredPickupDate");
    const rawPreferredPickupDate = Array.from(preferredPickupDateElements).find((element) => element.value).value;
    const formattedPreferredPickupDate = formatDate(rawPreferredPickupDate);
    const [dayText, month, dayNumber, year] = formattedPreferredPickupDate.split(/[\s,]+/);
    const dayPref = addOrdinalSuffix(dayNumber);
    const hour = document.querySelector("#Contract_PreferredPickupHour").value;
    const minute = document.querySelector("#Contract_PreferredPickupMinute").value.padStart(2, "0");
    const ampm = document.querySelector("#Contract_PreferredPickupAmPm").value
    const capitalizeWords = ["LLC", "INC", "PSL"];
    const locationDetails = document.querySelector("#mapLocationDetails > div.row > div:nth-child(2) > dl");
    const ddElements = locationDetails.querySelectorAll("dd");
    const dtElements = locationDetails.querySelectorAll("dt");
    const pickupCityStateZip = ddElements[1].innerText.split("\n")[1].trim()
    const pickupStreet = ddElements[1].innerText.split("\n")[0].trim();
    const [street, city, state, zipcode] = processAddress(pickupCityStateZip, pickupStreet);
    const businessName = processBusinessName(ddElements[0].innerText, capitalizeWords);
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
            pickupCity: processWord(text.split(",")[0].trim(), [], ['of', 'the']),
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

    let CurrentSelector = "";
    let MessageTemplateLastVisible = false;
    const MessageTemplates = {
        "Storage Offer": {
            func: StorageOfferMessage,
            overrideOriginalMessage: true,

            shouldRun: function () {
                if (document.querySelector("#DispatchDate")) {
                    return true
                }

                return false
            }
        },

        "E-Alert Notice": {
            func: EAlertNotice,
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
            func: MobilePickupRental,
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
            func: EquipChange,
            overrideOriginalMessage: true,

            shouldRun: function () {
                if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate")) {
                    return true
                }

                return false
            }
        },

        "New Dropoff": {
            func: NewDropoffMessage,
            overrideOriginalMessage: true,

            shouldRun: function () {
                if (document.querySelector("#DispatchDate")) {
                    return true
                }

                return false
            }
        },

        "New Pickup": {
            func: NewPickupMessage,
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
            func: LatePickupNoticeMessage,
            overrideOriginalMessage: true,

            shouldRun: function () {
                if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate")) {
                    return true
                }

                return false
            }
        },

        "Late Pickup Cancellation": {
            func: CancelationMessage,
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
            func: TestingMessage,
            overrideOriginalMessage: true,

            shouldRun: function () {
                return false
            }
        },

        "Low Availability ": {
            func: LowAvailabilityMessage,
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
            func: HighDemandMessage,
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
            func: NoAssignedLocation,
            overrideOriginalMessage: true,

            shouldRun: function () {
                const spanElement = document.querySelector('span.custom.checkbox.disabled');
                if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate")) {
                    return true
                }

                return false
            }
        },

        "Testing Values": {
            func: TestingMessage,
            overrideOriginalMessage: false,

            shouldRun: function () {
                return false
            }
        },
    };

    function isMessageTemplatesForumVisible() {
        const textSubmitForm = document.querySelector("#textMessageArea");
        if (
            textSubmitForm &&
            textSubmitForm.offsetWidth > 0 &&
            textSubmitForm.offsetHeight > 0
        ) {
            return true;
        }
        LastVisible = false;
        return false;
    }

    function createAndInsertDropdown(id, label, options) {
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
            select.appendChild(optionElement);
        });
        container.appendChild(select);

        return container;
    }

    function runWhenTextSubmitFormVisible() {
        if (LastVisible === false) {
            LastVisible = true;

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

            function updateMessage() {
                if (CurrentSelector == "Equipment Change") {
                    const newEquip1 = document.querySelector("#newEquip");
                    const oldEquip1 = document.querySelector("#oldEquip");
                    const styleDropdown = document.querySelector("#styleDropdown");
                    if (newEquip && oldEquip && styleDropdown) {
                        let NewMsg = "";
                        const dynamicValues = getDynamicValuesForTemplate(CurrentSelector);
                        const newEquip = newEquip1.options[newEquip1.selectedIndex].textContent.split(" - ")[1];
                        const oldEquip = oldEquip1.options[oldEquip1.selectedIndex].textContent.split(" - ")[1];
                        const style = styleDropdown.options[styleDropdown.selectedIndex].text;

                        if (style === "Regular") {
                            NewMsg = `U-Haul Reservation: #${dynamicValues.resNumber} : ${dynamicValues.cxLastName}
Your U-Haul equipment has been changed from "${oldEquip}" to "${newEquip}". If you have other equipment reserved, they will not appear in this message, please check your reservation on Uhaul.com for further details.
${MessageEnd}`;
                        } else if (style === "Lack of availability") {
                            NewMsg = `U-Haul Reservation: #${dynamicValues.resNumber} : ${dynamicValues.cxLastName}
Due to lack of availability in your preferred area your U-Haul Equipment has been updated changed from "${oldEquip}" to "${newEquip}". If you have other equipment reserved, they will not appear in this message, please check your reservation on Uhaul.com for further details.
${MessageEnd}`;
                        }

                        if (document.getElementById(`${CurrentSelector}:DynamicTemplate`)) {
                            const HiddenMsg = document.getElementById(`${CurrentSelector}:DynamicTemplate`)
                            HiddenMsg.value = NewMsg
                        }
                    }
                }

                if (CurrentSelector == "New Pickup") {
                    const styleDropdown = document.querySelector("#styleDropdown");
                    if (styleDropdown) {
                        let NewMsg = "";
                        const dynamicValues = getDynamicValuesForTemplate(CurrentSelector);
                        const style = styleDropdown.options[styleDropdown.selectedIndex].text;

                        if (style === "Regular") {
                            NewMsg = `U-Haul Reservation: #${dynamicValues.resNumber} : ${dynamicValues.cxLastName}
Your pick up has been updated! You can find your equipment available to pickup at ${dynamicValues.pickupBusinessName}, ${dynamicValues.pickupStreet}, ${dynamicValues.pickupState} ${dynamicValues.pickupCity} ${dynamicValues.pickupZipcode} on ${dynamicValues.pickupDay}, ${dynamicValues.pickupMonthNum} ${dynamicValues.pickupDayNum}, ${dynamicValues.pickupYear} at ${dynamicValues.pickupHour}:${dynamicValues.pickupMinute} ${dynamicValues.pAMPM}.
If you have any questions or concerns regarding your new pick up location, please call U-Haul Regional Scheduling Office.
${MessageEnd}`;
                        } else if (style === "Lack of availability") {
                            NewMsg = `U-Haul Reservation: #${dynamicValues.resNumber} for ${dynamicValues.cxLastName}
We regret to inform you that your pick-up location has been updated due to equipment availability. Your equipment will be ready for pick-up at ${dynamicValues.pickupBusinessName}, ${dynamicValues.pickupStreet}, ${dynamicValues.pickupState} ${dynamicValues.pickupCity} ${dynamicValues.pickupZipcode} on ${dynamicValues.pickupMonthNum}/${dynamicValues.pickupDayNum}/${dynamicValues.pickupYear} at ${dynamicValues.pickupHour}:${dynamicValues.pickupMinute} ${dynamicValues.pAMPM}.
We apologize for any inconvenience caused by this change. If you require assistance, need information on alternative equipment sizes, or wish to reschedule, do not hesitate to contact the U-Haul Regional Scheduling Office.
${MessageEnd}`;
                        }

                        if (document.getElementById(`${CurrentSelector}:DynamicTemplate`)) {
                            const HiddenMsg = document.getElementById(`${CurrentSelector}:DynamicTemplate`)
                            HiddenMsg.value = NewMsg
                        }
                    }
                }

                if (CurrentSelector == "New Dropoff") {
                    const styleDropdown = document.querySelector("#styleDropdown");
                    if (styleDropdown) {
                        let NewMsg = "";
                        const dynamicValues = getDynamicValuesForTemplate(CurrentSelector);
                        const style = styleDropdown.options[styleDropdown.selectedIndex].text;

                        if (style === "Regular") {
                            NewMsg = `U-Haul Reservation: #${dynamicValues.resNumber} : ${dynamicValues.cxLastName}
Your dropoff has been updated! You can return your equipment to ${dynamicValues.pickupBusinessName}, ${dynamicValues.pickupStreet}, ${dynamicValues.pickupState} ${dynamicValues.pickupZipcode} on ${dynamicValues.pickupDay}, ${dynamicValues.pickupMonthNum} ${dynamicValues.pickupDayNum}, ${dynamicValues.pickupYear} at ${dynamicValues.pickupHour}:${dynamicValues.pickupMinute} ${dynamicValues.pAMPM}.
If you have any questions or concerns regarding your new dropoff location, please call U-Haul Regional Scheduling Office.
${MessageEnd}`;
                        } else if (style === "Lack of availability") {
                            NewMsg = `U-Haul Reservation: #${dynamicValues.resNumber} : ${dynamicValues.cxLastName}
Unfortunately, your dropoff location has been rescheduled to the nearest location that is able to receive your equipment. You will be able to return your equipment to ${dynamicValues.pickupBusinessName}, ${dynamicValues.pickupStreet}, ${dynamicValues.pickupState} ${dynamicValues.pickupZipcode} on ${dynamicValues.pickupDay}, ${dynamicValues.pickupMonthNum} ${dynamicValues.pickupDayNum}, ${dynamicValues.pickupYear} at ${dynamicValues.pickupHour}:${dynamicValues.pickupMinute} ${dynamicValues.pAMPM}.
We apologize for any inconveniences this may cause for you, if you have any questions, please call U-Haul Regional Scheduling Office.
${MessageEnd}`;
                        }

                        if (document.getElementById(`${CurrentSelector}:DynamicTemplate`)) {
                            const HiddenMsg = document.getElementById(`${CurrentSelector}:DynamicTemplate`)
                            HiddenMsg.value = NewMsg
                        }
                    }
                }

                if (CurrentSelector == "Cancelation Notice") {
                    const styleDropdown = document.querySelector("#styleDropdown");
                    if (styleDropdown) {
                        let NewMsg = "";
                        const dynamicValues = getDynamicValuesForTemplate(CurrentSelector);
                        const style = styleDropdown.options[styleDropdown.selectedIndex].text;

                        if (style === "Confirmation") {
                            NewMsg = `U-Haul Reservation Cancelation: #${dynamicValues.resNumber} : ${dynamicValues.cxLastName}
Your U-Haul reservation has recently been canceled. If you did not request this cancelation, please contact us at (561) 638-9428. Please have your reference number ready when you call.
Reference number: ${dynamicValues.resNumber}
Pickup Date: ${dynamicValues.pickupDay}, ${dynamicValues.pickupMonthNum} ${dynamicValues.pickupDayNum}, ${dynamicValues.pickupYear}
${MessageEnd}`;
                        } else if (style === "No Call/No Show") {
                            NewMsg = `U-Haul Reservation Cancelation: #${dynamicValues.resNumber} : ${dynamicValues.cxLastName}
Your U-Haul reservation has recently been canceled. Due to failure of pickup your U-Haul reservation scheduled on ${dynamicValues.pickupDay}, ${dynamicValues.pickupMonthNum} ${dynamicValues.pickupDayNum}, ${dynamicValues.pickupYear} in ${dynamicValues.pickupCity}, ${dynamicValues.pickupState}
your reservation has been automatically cancelled, if you believe this was a mistake and are still in-need of this equipment, please contact us at (561) 638-9428. Please have your reference number ready when you call.
Reference number: ${dynamicValues.resNumber}
Pickup Date: ${dynamicValues.pickupDay}, ${dynamicValues.pickupMonthNum} ${dynamicValues.pickupDayNum}, ${dynamicValues.pickupYear} at ${dynamicValues.pickupHour}:${dynamicValues.pickupMinute} ${dynamicValues.pAMPM}
${MessageEnd}`;
                        } else if (style === "Duplicate") {
                            NewMsg = `U-Haul Reservation Cancelation: #${dynamicValues.resNumber} : ${dynamicValues.cxLastName}
Your U-Haul reservation has recently been canceled. Our records lead us to believe you may have booked duplicate reservations, we see you have already picked up your requested equipment at a different location.
In result, your reservation has been cancelled, if you believe this was a mistake and are still in-need of this equipment, please contact us at (561) 638-9428. Please have your reference number ready when you call.
Reference number: ${dynamicValues.resNumber}
Pickup Date: ${dynamicValues.pickupDay}, ${dynamicValues.pickupMonthNum} ${dynamicValues.pickupDayNum}, ${dynamicValues.pickupYear} at ${dynamicValues.pickupHour}:${dynamicValues.pickupMinute} ${dynamicValues.pAMPM}
${MessageEnd}`;
                        }

                        if (document.getElementById(`${CurrentSelector}:DynamicTemplate`)) {
                            const HiddenMsg = document.getElementById(`${CurrentSelector}:DynamicTemplate`)
                            HiddenMsg.value = NewMsg
                        }
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
                        { value: "BE", text: "BE - Cargo Van" },
                        { value: "BP", text: "BP - Pickup Truck" },
                        { value: "MP", text: "MP - Ford Maverick Pickup Truck" },
                        { value: "TM", text: "TM - 10' Box Truck" },
                        { value: "DC", text: "DC - 15' Box Truck" },
                        { value: "EL", text: "EL - 17' Box Truck" },
                        { value: "TT", text: "TT - 20' Box Truck" },
                        { value: "JH", text: "JH - 26' Box Truck" },
                        { value: "FS", text: "FS - 4' X 7' Open Trailer" },
                        { value: "AO", text: "AO - 5' X 8' Open Trailer" },
                        { value: "RO", text: "RO - 6' X 12' Open Trailer" },
                        { value: "HO", text: "HO - 6' X 12' Open Trailer w/Ramp" },
                        { value: "UV", text: "UV - 4' X 8' Enclosed Trailer" },
                        { value: "AV", text: "AV - 5' X 8' Enclosed Trailer" },
                        { value: "RV", text: "RV - 6' X 12' Enclosed Trailer" },
                        { value: "RT", text: "RT - 5' X 9' Open Trailer w/Ramp" },
                        { value: "MT", text: "MT - Motorcycle Trailer" },
                        { value: "TD", text: "TD - Tow Dolly" },
                        { value: "AT", text: "AT - Auto Transport" },
                        { value: "AA", text: "AA - Wooden U-Box" },
                        { value: "AB", text: "AB - Plastic U-Box" },
                    ];

                    const styleOptions = [
                        { value: "1", text: "Regular" },
                        { value: "2", text: "Lack of availability" },
                    ];

                    const oldEquip = createAndInsertDropdown("oldEquip", "Old Equipment:", EquipList);
                    const newEquip = createAndInsertDropdown("newEquip", "New Equipment:", EquipList);
                    const styleDropdown = createAndInsertDropdown("styleDropdown", "Message Style:", styleOptions);

                    extraDropdownsContainer.appendChild(oldEquip);
                    extraDropdownsContainer.appendChild(newEquip);
                    extraDropdownsContainer.appendChild(styleDropdown);

                    // Add event listeners to the additional dropdowns to update the message when their values change
                    oldEquip.addEventListener("change", updateMessage);
                    newEquip.addEventListener("change", updateMessage);
                    styleDropdown.addEventListener("change", updateMessage);

                    // Update the message initially based on the default selected values
                    updateMessage();
                }

                if (selectedOptionValue.trim() === "New Pickup") {
                    const styleOptions = [
                        { value: "1", text: "Regular" },
                        { value: "2", text: "Lack of availability" },
                    ];

                    const styleDropdown = createAndInsertDropdown("styleDropdown", "Message Style:", styleOptions);
                    extraDropdownsContainer.appendChild(styleDropdown);

                    // Add event listeners to the additional dropdowns to update the message when their values change
                    styleDropdown.addEventListener("change", updateMessage);

                    // Update the message initially based on the default selected values
                    updateMessage();
                }

                if (selectedOptionValue.trim() === "New Dropoff") {
                    const styleOptions = [
                        { value: "1", text: "Regular" },
                        { value: "2", text: "Lack of availability" },
                    ];

                    const styleDropdown = createAndInsertDropdown("styleDropdown", "Message Style:", styleOptions);
                    extraDropdownsContainer.appendChild(styleDropdown);

                    // Add event listeners to the additional dropdowns to update the message when their values change
                    styleDropdown.addEventListener("change", updateMessage);

                    // Update the message initially based on the default selected values
                    updateMessage();
                }

                if (selectedOptionValue.trim() === "Cancelation Notice") {
                    const cancelReasons = [
                        { value: "1", text: "Confirmation" },
                        { value: "2", text: "No Call/No Show" },
                        { value: "3", text: "Duplicate" },
                    ];

                    const cancelDropdown = createAndInsertDropdown("styleDropdown", "Cancelation Reason", cancelReasons);
                    extraDropdownsContainer.appendChild(cancelDropdown);

                    // Add event listeners to the additional dropdowns to update the message when their values change
                    cancelDropdown.addEventListener("change", updateMessage);

                    // Update the message initially based on the default selected values
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
                const formattedMessage = MessageTemplates[key].func(
                    dynamicValues.cxFirstName,
                    dynamicValues.cxLastName,
                    dynamicValues.resNumber,
                    dynamicValues.pickupMonthNum,
                    dynamicValues.pickupDayNum,
                    dynamicValues.pickupYear,
                    dynamicValues.pickupHour,
                    dynamicValues.pickupMinute,
                    dynamicValues.pickupDay,
                    dynamicValues.pAMPM,
                    dynamicValues.pickupCity,
                    dynamicValues.pickupState,
                    dynamicValues.pickupStreet,
                    dynamicValues.pickupZipcode,
                    dynamicValues.pickupBusinessName,
                    dynamicValues.pickupPhone
                );

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
}

// Function to continuously check if the textSubmitForm is visible
function isMessageTemplatesForumVisibleRepeat() {
    console.log("Running [Dynamic Message Templates]")

    setInterval(() => {
        if (isMessageTemplatesForumVisible()) {
            console.log("Executed [Dynamic Message Templates]")
            runWhenTextSubmitFormVisible();
        } else {
            CurrentSelector = "";
        }
    }, 100); // Check every 100ms
}

// Start checking the textSubmitForm visibility
isMessageTemplatesForumVisibleRepeat();
