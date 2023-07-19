// ==UserScript==
// @name         [Experimental] Custom Message Template V2
// @namespace    http://tampermonkey.net/
// @description  Custom template for message templates
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==
let MessageTemplateLastVisible = false;
let CSS_StyleSheetAdded = false;

const MsgTemplates = {
    "LatePickupNotice": {
        Display: "LatePickupNotice",

        MsgTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("LatePickupNotice");

            if (!SubOptions === false) {
                const isAvail = stringToBoolean(SubOptions.isAvail.SelectedValue)

                return `Reservation; Late Pickup Reminder : #${ResInfo.contractNumber} : ${ResInfo.customerFirstName} ${ResInfo.customerLastName}
Our records indicate your rental has not yet been started and may be at risk of cancelation. ${isAvail ? 'If you would like to reschedule your reservation located at ' : `Unfortunely the equipment is no longer available at ${ResInfo.businessName} and would need to be relocated, `} ${isAvail ? `${ResInfo.businessName} located off ${ResInfo.street}, ${ResInfo.city}, ${ResInfo.state} ${ResInfo.zipcode} for a different date/time please contact us using the number provided below` : 'we ask you call us at your earliest convience using the number below to discuss alternative solutions'}.
${ResInfo.MCOEnd}`
            }

            return `Failed to create message :(`
        },

        NoteTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("LatePickupNotice");
            const isAvail = stringToBoolean(SubOptions.isAvail.SelectedValue)

            return {
                Text: `Text Sent to Customer - Message Type: Late Pickup, Equipment Available: ${isAvail}, Assigned Location: ${ResInfo.Entity}, Scheduled Date: ${ResInfo.dayText}, ${ResInfo.monthNumber} ${ResInfo.dayNumber}, ${ResInfo.year} at ${ResInfo.hour}:${ResInfo.minute} ${ResInfo.AMPM}`,
                ExpectedIn: false,
                Working: true,
            }
        },

        Dropdown: ["LatePickupNotice", {
            "isAvail": {
                DisplayText: "Equipment Available",
                DefaultOption: true,
                Type: "Normal",
                Options: [
                    { value: true, text: "Yes" },
                    { value: false, text: "No" },
                ]
            },
        }],

        Params: function () {
            const spanElement = document.querySelector('span.custom.checkbox.disabled');
            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate") && spanElement && spanElement.classList.contains('checked')) {
                return true
            }

            return false
        },
    },

    "CancelationNotice": {
        Display: "CancelationNotice",

        MsgTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("CancelationNotice");

            if (!SubOptions === false) {
                const cancelReason = SubOptions.cancelReason.SelectedValue

                if (cancelReason === "Confirm") {
                    return `Reservation; Cancelation Notice : #${ResInfo.contractNumber} : ${ResInfo.customerFirstName} ${ResInfo.customerLastName}
Your U-Haul Reservation was recently canceled, this reservation was scheduled for ${ResInfo.businessName} in ${ResInfo.city}, ${ResInfo.state} ${ResInfo.zipcode}. We hope to see you back soon! If you change your mind in the near future,
you can call us at the number below to make new arrangements.
${ResInfo.MCOEnd}`
                } else if (cancelReason === "Late") {
                    return `Reservation; Cancelation Notice : #${ResInfo.contractNumber} : ${ResInfo.customerFirstName} ${ResInfo.customerLastName}
We hope we didn't miss your arrival, our records indicate your reservation scheduled for ${ResInfo.businessName} in ${ResInfo.city}, ${ResInfo.state} ${ResInfo.zipcode} was not picked up and has automatically been canceled.
If you believe this was a mistake and you are still in-need of this reservation, you can call us using the number below to make new arrangements.
you can call us at the number below to make new arrangements.
${ResInfo.MCOEnd}`
                } else if (cancelReason === "Duplicate") {
                    return `Reservation; Cancelation Notice : #${ResInfo.contractNumber} : ${ResInfo.customerFirstName} ${ResInfo.customerLastName}
Your U-Haul Reservation was recently canceled, our records indicated multiple reservations may have been made. In result, reservation #${ResInfo.contractNumber} has been canceled. If you believe this was a mistake and are in need of multiple reservations,
please call us using the number below to reinstate this reservation.
${ResInfo.MCOEnd}`
                }
            }

            return `Failed to create message :(`
        },

        NoteTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("CancelationNotice");
            const cancelReason = SubOptions.cancelReason.SelectedValue

            return {
                Text: `Text Sent to Customer - Message Type: Cancelation Notice, Assigned Location: ${ResInfo.Entity}, Previously Scheduled Date: ${ResInfo.dayText}, ${ResInfo.monthNumber} ${ResInfo.dayNumber}, ${ResInfo.year} at ${ResInfo.hour}:${ResInfo.minute} ${ResInfo.AMPM}`,
                ExpectedIn: false,
                Working: true,
            }
        },

        Dropdown: ["CancelationNotice", {
            "cancelReason": {
                DisplayText: "Reason",
                DefaultOption: "Confirm",
                Type: "Normal",
                Options: [
                    { value: "Confirm", text: "Confirmation" },
                    { value: "Late", text: "No Call/No Show" },
                    { value: "Duplicate", text: "Duplicate" },
                ]
            },
        }],

        Params: function () {
            const spanElement = document.querySelector('span.custom.checkbox.disabled');
            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate") && spanElement && spanElement.classList.contains('checked')) {
                return true
            }

            return false
        },
    },

    "StorageOffer": {
        Display: "StorageOffer",

        MsgTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("StorageOffer");
            const zipcode = [
                33004, 33009, 33019, 33020, 33021, 33023, 33024, 33025, 33026, 33027,
                33028, 33029, 33060, 33062, 33063, 33064, 33065, 33066, 33067, 33068,
                33069, 33071, 33073, 33076, 33301, 33304, 33305, 33306, 33308, 33309,
                33311, 33312, 33313, 33314, 33315, 33316, 33317, 33319, 33321, 33322,
                33323, 33324, 33325, 33326, 33327, 33328, 33330, 33331, 33332, 33334,
                33351, 33401, 33403, 33404, 33405, 33406, 33407, 33408, 33409, 33410,
                33411, 33412, 33413, 33414, 33415, 33417, 33418, 33426, 33428, 33430,
                33431, 33432, 33433, 33434, 33435, 33436, 33437, 33438, 33440, 33441,
                33442, 33444, 33445, 33446, 33449, 33455, 33458, 33460, 33461, 33462,
                33463, 33467, 33469, 33470, 33472, 33473, 33476, 33477, 33478, 33480,
                33483, 33484, 33486, 33487, 33493, 33496, 33498, 34945, 34946, 34947,
                34949, 34950, 34951, 34952, 34953, 34956, 34957, 34972, 34974, 34981,
                34982, 34983, 34984, 34986, 34987, 34990, 34994, 34996, 34997
            ];

            if (!SubOptions === false) {
                let Nearby73 = false
                if (zipcode.includes(ResInfo.zipcode)) {
                    Nearby73 = true
                }

                return `CONGRATULATIONS, ${ResInfo.customerFirstName.toUpperCase()}!
As a special thank you for choosing U-Haul, we are offering you 1 FREE MONTH OF STORAGE! We offer Drive up Storage, 24/7 Secured Inside Units & Climate Controlled Storage. NO DEPOSIT & Individually alarmed room
with 24-Hour Access & MORE! To take advantage of this offer contact (561) 638-9428 and use your reference number ${ResInfo.contractNumber} and we will be able to assist you with getting a unit set up ${Nearby73 ? 'at U-Haul Moving & Storage Of West Palm Beach, 2805 Vista Pkwy West Palm Beach, FL 33411!' : `in or nearby ${ResInfo.city}!`}
We hope to hear from you soon and welcome to you ${ResInfo.city}, ${ResInfo.state}
${ResInfo.MCOEnd}`
            }

            return `Failed to create message :(`
        },

        NoteTemplate: function () {
            return {
                Text: `Text Sent to Customer - Message Type: Storage Offer`,
                ExpectedIn: true,
                Working: false,
            }
        },

        Dropdown: ["StorageOffer", {
        }],

        Params: function () {
            if (document.querySelector("#DispatchDate")) {
                return true
            }

            return false
        },
    },

    "Truckshare": {
        Display: "Truckshare",

        MsgTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("Truckshare");

            if (!SubOptions === false) {
                return `Reservation; 24/7 Truckshare Reminder : #${ResInfo.contractNumber} : ${ResInfo.customerFirstName} ${ResInfo.customerLastName}
You are receiving this message as your reservation scheduled for ${ResInfo.businessName} will not be open at ${ResInfo.hour}:${ResInfo.minute} ${ResInfo.AMPM}, In order to proceed with the 24/7 Process you will need the U-Haul mobile app
https://uhaul.com/s/6859554008, Additionally to learn more about the process you will find a full set of instructions as well a youtube guide to help you here http://uhaul.com/s/E4260B3676, If you have any questions please contact us using the number below.
${ResInfo.MCOEnd}`
            }

            return `Failed to create message :(`
        },

        NoteTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("NewPickup");

            return {
                Text: `Text Sent to Customer - Message Type: Truckshare Notice, Assigned Location: ${ResInfo.Entity}, Scheduled Date: ${ResInfo.dayText}, ${ResInfo.monthNumber} ${ResInfo.dayNumber}, ${ResInfo.year} at ${ResInfo.hour}:${ResInfo.minute} ${ResInfo.AMPM}, Notes: Location will not be open at customers preferred time.`,
                ExpectedIn: false,
                Working: true,
            }
        },

        Dropdown: ["Truckshare", {
        }],

        Params: function () {
            const spanElement = document.querySelector('span.custom.checkbox.disabled');

            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate") && document.querySelector("#ReservationSummaryTab > div:nth-child(1) > div.medium-6.large-7.columns > label > span.custom.checkbox.checked") && spanElement && spanElement.classList.contains('checked')) {
                return true
            }

            return false
        },
    },

    "HighDemand": {
        Display: "HighDemand",

        MsgTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("HighDemand");

            if (!SubOptions === false) {
                return `Reservation; High Demand Notice : #${ResInfo.contractNumber} : ${ResInfo.customerFirstName} ${ResInfo.customerLastName}
You are receiving this notice to advise you we are experiencing a high volume of incoming reservations into ${ResInfo.amtCity}, ${ResInfo.amtState}. We ask you to reach out to us at your earliest availability to discuss further flexibility you may have with the Date/Time, Distance, and Equipment Size.
If we aren't able to confirm details prior to ${ResInfo.dayText}, ${ResInfo.monthNumber} ${ResInfo.dayNumber}, ${ResInfo.year} unwanted changes may be made during the scheduling process.
As a reminder, the model, date, and location that you are choosing is a preference and further changes may need to be made to accommodate your reservation.
${ResInfo.MCOEnd}`
            }

            return `Failed to create message :(`
        },

        NoteTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("HighDemand");

            return {
                Text: `Text Sent to Customer - Message Type: High Demand Notice, Preferred Date: ${ResInfo.dayText}, ${ResInfo.monthNumber} ${ResInfo.dayNumber}, ${ResInfo.year} at ${ResInfo.hour}:${ResInfo.minute} ${ResInfo.AMPM}, Preferred City: ${ResInfo.city}`,
                ExpectedIn: false,
                Working: true,
            }
        },

        Dropdown: ["HighDemand", {
        }],

        Params: function () {
            const spanElement = document.querySelector('span.custom.checkbox.disabled');
            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate") && spanElement && !spanElement.classList.contains('checked')) {
                return true
            }

            return false
        },
    },

    "LowAvailability": {
        Display: "LowAvailability",

        MsgTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("LowAvailability");

            if (!SubOptions === false) {
                return `Reservation; Low Availability Notice : #${ResInfo.contractNumber} : ${ResInfo.customerFirstName} ${ResInfo.customerLastName}
You are receiving this notice to advise you we are experiencing delays with incoming equipment into your preferred city scheduled for ${ResInfo.dayText}, ${ResInfo.monthNumber} ${ResInfo.dayNumber}, ${ResInfo.year}.
We are informing you that you will need to reschedule your reservation for a different date/time or select a larger/smaller size of equipment. We will be in contact with you soon to discuss alternative availability.
you can contact our office directly using the number below!
${ResInfo.MCOEnd}`
            }

            return `Failed to create message :(`
        },

        NoteTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("LowAvailability");

            return {
                Text: `Text Sent to Customer - Message Type: Low Avail, Scheduled Date: ${ResInfo.dayText}, ${ResInfo.monthNumber} ${ResInfo.dayNumber}, ${ResInfo.year} at ${ResInfo.hour}:${ResInfo.minute} ${ResInfo.AMPM}`,
                ExpectedIn: false,
                Working: true,
            }
        },

        Dropdown: ["LowAvailability", {
        }],

        Params: function () {
            const spanElement = document.querySelector('span.custom.checkbox.disabled');
            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate") && spanElement && !spanElement.classList.contains('checked')) {
                return true
            }

            return false
        },
    },

    "EquipmentChange": {
        Display: "EquipmentChange",

        MsgTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("EquipmentChange");

            if (!SubOptions === false) {
                let PreviousEquipment = "";
                let NewEquipment = "";
                if (SubOptions.OldEquipment.SelectedValue === "Blank") {
                    PreviousEquipment = "unassigned"
                } else {
                    PreviousEquipment = SubOptions.OldEquipment.SelectedText.split(" - ")[1].trim()
                }

                if (SubOptions.NewEquipment.SelectedValue === "Blank") {
                    NewEquipment = "unassigned"
                } else {
                    NewEquipment = SubOptions.NewEquipment.SelectedText.split(" - ")[1].trim()
                }

                const locChangedValue = stringToBoolean(SubOptions.LocChanged.SelectedValue)
                const freeUpgrade = stringToBoolean(SubOptions.FreeUpgrade.SelectedValue)

                return `Reservation; Equipment Changed : #${ResInfo.contractNumber} : ${ResInfo.customerFirstName} ${ResInfo.customerLastName}
The equipment you reserved has been updated. ${(locChangedValue ? 'Due to scheduling changes at your assigned location, the requested' : 'The requested')} "${PreviousEquipment}" has been updated to "${NewEquipment}"${freeUpgrade ? ', additionally this change will not have an effect on the rate of your rental' : ', the rate of the equipment has been changed'}.
If you have other equipment reserved, they will not appear in this message. Please review your reservation at uhaul.com/orders for complete details or contact the number listed below for further information regarding this change.
${ResInfo.MCOEnd}`
            }

            return `Failed to create message :(`
        },

        NoteTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("EquipmentChange");
            const locChangedValue = stringToBoolean(SubOptions.LocChanged.SelectedValue)
            const freeUpgrade = stringToBoolean(SubOptions.FreeUpgrade.SelectedValue)

            return {
                Text: `Text Sent to Customer - Message Type: Equipment Change, Assigned Location: ${ResInfo.Entity}, Scheduled Date: ${ResInfo.dayText}, ${ResInfo.monthNumber} ${ResInfo.dayNumber}, ${ResInfo.year} at ${ResInfo.hour}:${ResInfo.minute} ${ResInfo.AMPM}, Changed from "${SubOptions.OldEquipment.SelectedValue}" to "${SubOptions.NewEquipment.SelectedValue}"`,
                ExpectedIn: false,
                Working: true,
            }
        },

        Dropdown: ["EquipmentChange", {
            "OldEquipment": {
                DisplayText: "Previous Equipment",
                DefaultOption: "Blank",
                Type: "Search",
                Options: [
                    { value: "Blank", text: "Select an option" },
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
                    { value: "MV", text: "MV - 5' X 10' Enclosed Trailer" },
                    { value: "RV", text: "RV - 6' X 12' Enclosed Trailer" },
                    { value: "RT", text: "RT - 5' X 9' Open Trailer w/Ramp" },
                    { value: "MT", text: "MT - Motorcycle Trailer" },
                    { value: "TD", text: "TD - Tow Dolly" },
                    { value: "AT", text: "AT - Auto Transport" },
                    { value: "AA", text: "AA - Wooden U-Box" },
                    { value: "AB", text: "AB - Plastic U-Box" },
                ]
            },

            "NewEquipment": {
                DisplayText: "New Equipment",
                DefaultOption: "Blank",
                Type: "Search",
                Options: [
                    { value: "Blank", text: "Select an option" },
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
                    { value: "MV", text: "MV - 5' X 10' Enclosed Trailer" },
                    { value: "RV", text: "RV - 6' X 12' Enclosed Trailer" },
                    { value: "RT", text: "RT - 5' X 9' Open Trailer w/Ramp" },
                    { value: "MT", text: "MT - Motorcycle Trailer" },
                    { value: "TD", text: "TD - Tow Dolly" },
                    { value: "AT", text: "AT - Auto Transport" },
                    { value: "AA", text: "AA - Wooden U-Box" },
                    { value: "AB", text: "AB - Plastic U-Box" },
                ]
            },

            "LocChanged": {
                DisplayText: "Location Updated",
                DefaultOption: false,
                Type: "Normal",
                Options: [
                    { value: true, text: "Yes" },
                    { value: false, text: "No" },
                ]
            },

            "FreeUpgrade": {
                DisplayText: "Free Upgrade",
                DefaultOption: true,
                Type: "Normal",
                Options: [
                    { value: true, text: "Yes" },
                    { value: false, text: "No" },
                ]
            }
        }],

        Params: function () {
            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate")) {
                return true
            }

            return false
        },
    },

    "NewPickup": {
        Display: "NewPickup",

        MsgTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("NewPickup");

            if (!SubOptions === false) {
                const reminderMessage = stringToBoolean(SubOptions.PickupConfirmation.SelectedValue)
                const lowAvail = stringToBoolean(SubOptions.LowAvail.SelectedValue)

                if (!lowAvail) {
                    return `Reservation; New Pickup : #${ResInfo.contractNumber} : ${ResInfo.customerFirstName} ${ResInfo.customerLastName}
${reminderMessage ? 'Thank you for choosing U-Haul, as a reminder your reservation is scheduled at ' : 'Your pick-up address has been updated, please go to '} ${ResInfo.businessName} located off ${ResInfo.street}, ${ResInfo.city}, ${ResInfo.state} ${ResInfo.zipcode}.
Your reservation is scheduled for pickup at ${ResInfo.dayText}, ${ResInfo.monthNumber} ${ResInfo.dayNumber}, ${ResInfo.year} at ${ResInfo.hour}:${ResInfo.minute} ${ResInfo.AMPM}. If you have any questions regarding this location you can reach them at ${ResInfo.businessPhoneNumber} or
contact our office directly using the number below!
${ResInfo.MCOEnd}`
                } else {
                    return `Reservation; New Pickup : #${ResInfo.contractNumber} : ${ResInfo.customerFirstName} ${ResInfo.customerLastName}
We apologize for the inconvience, but due to scheduling issues at this time your pickup has been changed. Your equipment will be ready for pick-up at ${ResInfo.businessName} located off ${ResInfo.street}, ${ResInfo.city}, ${ResInfo.state} ${ResInfo.zipcode}.
Your reservation is scheduled for pickup at ${ResInfo.dayText}, ${ResInfo.monthNumber} ${ResInfo.dayNumber}, ${ResInfo.year} at ${ResInfo.hour}:${ResInfo.minute} ${ResInfo.AMPM}. If you have any questions regarding this location you can reach them at ${ResInfo.businessPhoneNumber} or
contact our office directly using the number below!
${ResInfo.MCOEnd}`
                }
            }

            return `Failed to create message :(`
        },

        NoteTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("NewPickup");
            const lowAvail = stringToBoolean(SubOptions.LowAvail.SelectedValue)

            return {
                Text: `Text Sent to Customer - Message Type: New Pickup, Assigned Location: ${ResInfo.Entity}, Scheduled Date: ${ResInfo.dayText}, ${ResInfo.monthNumber} ${ResInfo.dayNumber}, ${ResInfo.year} at ${ResInfo.hour}:${ResInfo.minute} ${ResInfo.AMPM}${lowAvail ? ', Notes: The equipment is currently appearing unavailable nearby cx preferred location.' : ''}`,
                ExpectedIn: false,
                Working: true,
            }
        },

        Dropdown: ["NewPickup", {
            "PickupConfirmation": {
                DisplayText: "Reminder",
                DefaultOption: true,
                Type: "Normal",
                Options: [
                    { value: true, text: "Yes" },
                    { value: false, text: "No" },
                ]
            },

            "LowAvail": {
                DisplayText: "Low Availability (Suggested for 15+ Miles)",
                DefaultOption: false,
                Type: "Normal",
                Options: [
                    { value: true, text: "Yes" },
                    { value: false, text: "No" },
                ]
            },
        }],

        Params: function () {
            const spanElement = document.querySelector('span.custom.checkbox.disabled');
            if (document.getElementById("cancelReservationLink") && !document.querySelector("#DispatchDate") && spanElement && spanElement.classList.contains('checked')) {
                return true
            }

            return false
        },
    },

    "CustomMessage": {
        Display: "CustomMessage",

        MsgTemplate: function () {
            const ResInfo = getResInformation();
            const SubOptions = getValInformation("CustomMessage");

            if (!SubOptions === false) {
                return `Reservation; #${ResInfo.contractNumber} : ${ResInfo.customerFirstName} ${ResInfo.customerLastName}
~
${ResInfo.MCOEnd}`
            }

            return `Failed to create message :(`
        },

        NoteTemplate: function () {
            return {
                Text: `Text Sent to Customer - Message Type: ~`,
                ExpectedIn: true,
                Working: false,
            }
        },

        Dropdown: ["CustomMessage", {
        }],

        Params: function () {
            return true
        },
    },
}

function stringToBoolean(string) {
    switch (string.toLowerCase().trim()) {
        case "true": return true;
        case "false": return false;
        case "yes": return true;
        case "no": return false;
        default: return Boolean(string);
    }
}

function submitEmbed(Data) {
    const webhookURL = 'https://discord.com/api/webhooks/1131072080503394404/spamAoxyeTJLlEmH_b8vpK7zEqkPE8o4ducnuCkocmPhZdKA-kpUEu4R60ewbp0IpEFi';

    const payload = {
        embeds: [
            {
                title: 'New Message',
                fields: [
                    { name: 'Person', value: Data.Actor },
                    { name: 'Note', value: Data.FirstLine },
                    { name: 'Message', value: Data.SecondLine },
                ],
            },
        ],
    };
console.log(payload)
    $.ajax({
        url: webhookURL,
        type: 'POST',
        data: JSON.stringify(payload),
        contentType: 'application/json',
        success: function(response) {
            // Handle successful request
            console.log('Embed submitted successfully!');
            console.log(response);
        },
        error: function(error) {
            // Handle error
            console.error('An error occurred while submitting the embed:');
            console.error(error);
        },
    });
}

function SubmitNote(n, t) {
    ShowLoadingDiv();
    $.ajax({
        url: n,
        type: "POST",
        data: t,
        datatype: "html",
        success: function (n) {
            if (HideLoadingDiv(),
                n.error) {
                toastr.error(n.error, "An error has occured:");
                return
            }

            if (!n) {
                toastr.error("Could not load.", "An error has occurred:");
            }

            ReloadCurrentReservation()
        },
        error: function (n) {
            HideLoadingDiv();
            toastr.error(n.responseText, "An error has occured:")
        }
    })
}

function createSubDropdown(id, data) {
    let container = document.createElement('div');
    container.className = "template-container";
    container.id = `${id}_DropdownContainer`

    const selectedValues = {}; // Object to store the selected values

    for (let key in data) {
        let selectId = id + key;

        let label = document.createElement('label');
        label.className = "template-label";
        label.textContent = `${data[key].DisplayText}:`;

        let select = document.createElement('select');
        select.id = selectId;
        select.name = selectId;
        select.className = "hidden-field";

        data[key].Options.forEach(option => {
            let optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;

            if (option.value === data[key].DefaultOption) {
                optionElement.selected = true;
                // Store the selected value and text
                selectedValues[key] = {
                    SelectedValue: option.value,
                    SelectedText: option.text
                };
            }

            select.appendChild(optionElement);
        });

        label.appendChild(select);

        // The dropdown visuals
        let dropdown = document.createElement('div');
        dropdown.className = "custom dropdown msgcorner";

        let current = document.createElement('a');
        current.href = "#";
        current.className = "current";
        current.textContent = selectedValues[key]?.SelectedText || "";
        dropdown.appendChild(current);

        let selector = document.createElement('a');
        selector.href = "#";
        selector.className = "selector";
        dropdown.appendChild(selector);

        let ul = document.createElement('ul');
        ul.className = "msgdropdown";

        data[key].Options.forEach(option => {
            let li = document.createElement('li');
            li.textContent = option.text;
            li.id = data[key].DisplayText;

            if (option.value === selectedValues[key]?.SelectedValue) {
                li.className = "selected";
            }

            ul.appendChild(li);
        });

        dropdown.appendChild(ul);
        label.appendChild(dropdown);
        container.appendChild(label);

        // Add event listener to each select element

        select.addEventListener('change', (event) => {
            updateMessageTemplate()
        });
    }

    setTimeout(function () {
        updateMessageTemplate()
    }, 100)

    return container;
}

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

function getResInformation() {
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

    return {
        // Contract Numbers
        rawContractNumber: document.querySelector("#ReservationPopup .whoseViewingStatus").getAttribute("data-contractid"),
        contractNumber: document.querySelector("#ReservationPopup #textDocumentNumber").value,

        // Customer Information
        customerFirstName: processName(document.querySelector("#customerFirstNameOnly").value.trim(), [], []),
        customerLastName: processName(document.querySelector("#ReservationPopup > section > header > h1").textContent.split("-")[1].trim(), [], []),

        // Equipment Information
        // Coming soon -- :)

        // Date Information
        monthNumber: month,
        dayNumber: dayPref,
        dayText: dayText,
        year: year,
        hour: hour,
        minute, minute,
        AMPM: ampm,

        // Business Information
        amtCity: processName(document.getElementById("FromCityValue").textContent.trim().split(",")[0].trim(), [], ['of', 'the']),
        amtState: processName(document.getElementById("FromCityValue").textContent.trim().split(",")[1].trim(), [], ['of', 'the']),
        city: city,
        state: state,
        street: street,
        zipcode: zipcode,
        businessName: businessName,
        businessPhoneNumber: phoneNumber,
        Entity: $("#pickUpEntityChosen").val() || "Unassigned",

        // MCO Information
        MCOEnd: "U-Haul Co. Palm Bay, FL (800) 649-2507"
    }
}

function getValInformation(id) {
    if (!id) {
        return false
    }

    const container = document.querySelector(`#${id}_DropdownContainer`);
    if (!container) {
        return false
    }

    const selectElements = container.getElementsByTagName("select");
    const selectedValues = {};

    for (let i = 0; i < selectElements.length; i++) {
        const selectElement = selectElements[i];
        const key = selectElement.name.replace(id, "");
        const selectedOption = selectElement.value;
        const selectedText = selectElement.options[selectElement.selectedIndex].text;

        selectedValues[key] = {
            SelectedValue: selectedOption,
            SelectedText: selectedText
        };
    }

    return selectedValues;
}

function AddMessageTemplate(n, t) {
    // Add Note Template
    const MsgData = MsgTemplates[document.querySelector("#customCustomerContactList .selected").textContent]
    if (MsgData) {
        $("#noteMessageArea").val(MsgData.NoteTemplate().Text)
    }

    // Add Message Template
    t.val(n.val())
}

function formatPhoneNumber(inputElement) {
    let value = inputElement.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10); // Limit to 10 numerical characters

    let formattedValue = '';
    if (value.length > 0) formattedValue += '(' + value.slice(0, 3);
    if (value.length > 3) formattedValue += ') ' + value.slice(3, 6);
    if (value.length > 6) formattedValue += '-' + value.slice(6);
    inputElement.value = formattedValue;
}

window.AddMessageTemplate = AddMessageTemplate;
window.formatPhoneNumber = formatPhoneNumber;

function updateMessageTemplate() {
    for (const MsgName in MsgTemplates) {
        const MsgData = MsgTemplates[MsgName]

        if (MsgData.Params()) {
            const existingOption = document.querySelector(`#mainTemplateList > #customCustomerContactTemplateDropdown > #${MsgName}`)
            const MessageTemplate = MsgData.MsgTemplate()
            existingOption.value = MessageTemplate
        }
    };
}

function MessageTextForumVisible() {
    if (MessageTemplateLastVisible === false) {
        MessageTemplateLastVisible = true;

        const MessagePopup = waitForElement("Body > #SecondaryPopup > #textSubmitForm", 5000)
        if (MessagePopup) {
            const ClonePhoneNumber = document.querySelector("#CustomerPhoneNumber").value
            document.querySelector("Body > #SecondaryPopup").style.borderRadius = '10px';

            const nMessagePopup = document.querySelector("Body > #SecondaryPopup > #textSubmitForm")
            nMessagePopup.innerHTML = `` // Reset Content

            const Html_Content = `
                <input id="ContractID" name="ContractID" type="hidden" value="${document.querySelector("#ContractId").value}">
                <input id="textFromView" name="ViewMode" type="hidden" value="Cover">

                <h3 class="header">Text Customer</h3>

                <div class="messagecontent custom form">
                    <div class="msgleft">
                        <label class="phonenumber-label">
                            Phone Number:
                            <input id="CustomerPhoneNumber" name="CustomerPhoneNumber" type="text" value="${ClonePhoneNumber}" class="phone-input">
                        </label>

                        <li class="templatesplit"></li>

                        <label class="msgList" id="mainTemplateList">
                            Create Template:

                            <select id="customCustomerContactTemplateDropdown" name="GetCustomCustomerContactTemplate" class="hidden-field">

                            </select>

                            <div class="custom dropdown msgcorner">
                                <a href="#" class="current">Testing Option 1</a>
                                <a href="#" class="selector"></a>

                                <ul class="msgdropdown" id="customCustomerContactList">

                                </ul>
                            </div>
                        </label>

                        <div class="template-indent">
                            <label class="template-label">
                                Option 1:

                                <select id="customCustomerContactTemplateDropdown" name="GetCustomCustomerContactTemplate" class="hidden-field">
                                    <option value="This is an option">Testing Option 1</option>
                                    <option value="This is an option">Testing Option 2</option>
                                    <option value="This is an option">Testing Option 3</option>
                                    <option value="This is an option">Testing Option 4</option>
                                    <option value="This is an option">Testing Option 5</option>
                                    <option value="This is an option">Testing Option 6</option>
                                    <option value="This is an option">Testing Option 7</option>
                                </select>

                                <div class="custom dropdown msgcorner">
                                    <a href="#" class="current">Testing Option 1</a>
                                    <a href="#" class="selector"></a>

                                    <ul class="msgdropdown">
                                        <li class="selected">Testing Option 1</li>
                                        <li class>Testing Option 2</li>
                                        <li class>Testing Option 3</li>
                                        <li class>Testing Option 4</li>
                                        <li class>Testing Option 5</li>
                                        <li class>Testing Option 6</li>
                                        <li class>Testing Option 7</li>
                                    </ul>
                                </div>
                            </label>
                        </div>

                        <button type="button" class="right msgcorner templateadd" onclick="AddMessageTemplate($('#mainTemplateList #customCustomerContactTemplateDropdown'), $('#textMessageArea'))">Add Template</button>
                    </div>

                    <div class="msgright">
                        <div>
                            Note Content:

                            <div class="msgBox Top">
                                <textarea placeholder="Add any additional notes or instructions here..." id="noteMessageArea" name="NoteMessage" class="message-textarea"></textarea>
                            </div>
                        </div>

                        <li class="templatesplit" style="opacity: 0;"></li>

                        <div style="height: 100%">
                            Message Content:

                            <div class="msgBox Bottom">
                                <textarea placeholder="Compose your message here..." id="textMessageArea" name="TextMessage" class="message-textarea"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="actionButtons">
                    <div class="large-12 columns">
                        <button type="submit" class="right save msgcorner">Send</button>
                        <button type="button" class="right cancel msgcorner" onclick="CloseModalPopup()">Cancel</button>
                    </div>
                </div>
            `
            nMessagePopup.innerHTML = Html_Content;

            var css = `
                .header {
                    border-top-right-radius: 5px;
                    border-top-left-radius: 5px;
                }

                .messagecontent {
                    display: flex;
                    flex-direction: row;
                    margin: 10px !important;
                    width: 100%;
                    height: 100%;
                    align-items: stretch; /* new */
                }

                .msgleft {
                    flex-grow: 0;
                    flex-shrink: 0;
                    padding-right: 20px;
                    width: 30%;
                }

                .msgright {
                    flex-grow: 0;
                    flex-shrink: 0;
                    padding-right: 30px;
                    display: flex;
                    flex-direction: column;
                    width: 70%;
                }

                .msgright .msgBox {
                    padding-top: 5px;
                }

                .msgright .Top {
                    flex-grow: 0;
                    flex-shrink: 0;
                    height: 30%;
                }

                .msgright .Bottom {
                    flex-grow: 0;
                    flex-shrink: 0;
                    height: calc(100% - 10px);
                    min-height: 10em;
                }

                .msgright .msgBox textarea {
                    flex-grow: 0;
                    flex-shrink: 0;
                    resize: none;
                    border-radius: 5px;
                    height: 100%;
                    border-radius: 5px;
                    margin-bottom: 0px !important;
                    margin-top: 0px !important;
                }

                .msgList {
                    margin-bottom: 20px;
                }

                .phone-input {
                    border-radius: 5px;
                }

                .msgcorner {
                    border-radius: 5px;
                }

                .msgdropdown {
                    border-radius: 5px;
                    margin-top: 5px !important;
                }

                .msgdropdowntemplate {
                    border: 1px solid #ccc;
                    position: relative;
                    top: 0;
                    height: 2em;
                    margin-bottom: 1.6666666667em;
                    padding: 0;
                    width: 100%;
                }

                .msgcurrent {
                    cursor: default;
                    white-space: nowrap;
                    line-height: 1.9166666667em;
                    color: rgba(0, 0, 0, 0.75);
                    overflow: hidden;
                    display: block;
                    margin-left: 0.5833333333em;
                    margin-right: 2em;
                }

                .actionButtons {
                    margin: -10px;
                    width: 100%;
                }

                .actionButtons button {
                    margin-top: 20px !important;
                    margin-bottom: 20px !important;
                }

                .templateadd {
                    margin-bottom: 0px !important;
                }

                .messagecontent .templatesplit {
                  border-bottom: none;
                  border-top: solid 1px #d6d6d6;
                  clear: both;
                  width: 100%;
                  padding-bottom: 10px;
                }

                .messagecontent .templatesplit::marker {
                    content: "";
                }

                .template-indent {
                    position: relative;
                    padding-left: 30px; /* Add more left padding to make space for the line */

                    /* Create the line */
                    &::before {
                        content: "";
                        position: absolute;
                        left: 10px; /* Adjust this to move the line left or right */
                        top: 0;
                        bottom: 0;
                        width: 1px; /* Adjust this to make the line thicker or thinner */
                        background-color: #d6d6d6; /* Change this to change the color of the line */
                    }
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

            const SaveButton = document.querySelector(".actionButtons .save")

            if (SaveButton) {
                SaveButton.addEventListener("click", async function () {
                    const MsgData = MsgTemplates[document.querySelector("#customCustomerContactList .selected").textContent]
                    if (MsgData) {
                        const Template = MsgData.NoteTemplate()
                        const AddedNote = {
                            Note: $("#noteMessageArea").val(),
                            Working: Template.Working,
                            ExpectedIn: Template.ExpectedIn,
                        }

                        if ($("#noteMessageArea").val().length > 1) {
                            const Toast = await waitForElement("#toast-container", 10000);

                            if (Toast.querySelector(".toast-info")) {
                                const URL_Split = amtURL.baseURL.toString().split("/")

                                function replaceSpacesWithPlus(str) {
                                    return str.replace(/ /g, '+');
                                }

                                const SelectedNote = replaceSpacesWithPlus(AddedNote.Note)
                                const ExpectedIn = AddedNote.ExpectedIn
                                const Working = AddedNote.Working
                                const NoteURL = `QuickNotes=&ContractNote.Note=${SelectedNote}&ContractNote.DownloadNote=false&ContractNote.WorkingNote=${Working}&ContractNote.SpecialInstructionNote=false&ContractNote.ExpectedInNote=${ExpectedIn}&ContractNote.ExpectedInNote=false&ContractNote.IsForOverdueEquipment=False&ContractNote.IsForOverdueRemoval=False&ContractNote.IsForReceivedOrDispatchedContract=False&ContractNote.IsFromExpectedIn=True&ContractNote.DenialType=None`
                                SubmitNote(`/${URL_Split[3]}/Reservations/AddNewContractNote`, NoteURL);
                            }
                        }

                        submitEmbed({
                            Actor: dynatraceUserName.textContent,
                            FirstLine: AddedNote.Note,
                            SecondLine: $("#textMessageArea").val(),
                        });
                    }
                });
            }

            // Phone Number formatting
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

            function handleTemplateDropdownChange(event) {
                const DropdownMenu = document.querySelector("#mainTemplateList .msgdropdown")
                const Selected = DropdownMenu.querySelector(".selected").textContent.trim()
                const SubMenu = document.querySelector(".template-indent")
                SubMenu.innerHTML = ``

                if (MsgTemplates[Selected]) {
                    const NewDropdown = createSubDropdown(MsgTemplates[Selected].Dropdown[0], MsgTemplates[Selected].Dropdown[1])
                    SubMenu.appendChild(NewDropdown);
                }
            }

            const mainDropdownChange = document.querySelector("#mainTemplateList #customCustomerContactTemplateDropdown");
            mainDropdownChange.addEventListener("change", handleTemplateDropdownChange);

            function updateCurrentAnchorText() {
                const list = document.querySelector("#mainTemplateList #customCustomerContactList");
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

            for (const MsgName in MsgTemplates) {
                const MsgData = MsgTemplates[MsgName]
                const MsgDisplayName = MsgData.Display

                if (MsgData.Params()) {
                    const MsgOption = document.createElement("li");
                    MsgOption.textContent = `${MsgDisplayName}`
                    MsgOption.id = `${MsgName}`
                    document.querySelector("#mainTemplateList > div > #customCustomerContactList").appendChild(MsgOption)

                    const MsgHiddenValue = new Option(MsgDisplayName, MsgName)
                    MsgHiddenValue.value = MsgData.MsgTemplate()
                    MsgHiddenValue.id = `${MsgName}`
                    document.querySelector("#mainTemplateList > #customCustomerContactTemplateDropdown").appendChild(MsgHiddenValue)
                }
            };

            updateCurrentAnchorText();
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

    addScriptVersion("Dynamic Messages V2", "4")

    setInterval(() => {
        if (isMessageTextForumVisible()) {
            MessageTextForumVisible();
        }
    }, 100); // Check every 100ms
}

isMessageTextForumVisibleInterval();
