// ==UserScript==
// @name         [Functional] Reservation Search
// @namespace    http://tampermonkey.net/
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==
let ResSearchLastVisible = false
function isReservationPanelOpen() {
    const targetElement = document.querySelector('#RSAreaCode');

    if (targetElement) {
        return true;
    } else {
        ResSearchLastVisible = false
        return false;
    }
}

function RunResSearch() {
    if (ResSearchLastVisible === false && !document.getElementById("newPhoneSelector")) {
        ResSearchLastVisible = true
        console.log("panel active")
        const OldPhoneNumberSelector = document.querySelector("#RSFormHide > div:nth-child(1) > div:nth-child(4)");
        OldPhoneNumberSelector.style.display = "none";

        const LastNameSelector = document.querySelector("#RSFormHide > div:nth-child(1) > div:nth-child(3)");
        let NewPhoneNumberSelector;
        NewPhoneNumberSelector = LastNameSelector.cloneNode(true);
        NewPhoneNumberSelector.setAttribute("id", "newPhoneSelector");

        LastNameSelector.parentElement.insertBefore(NewPhoneNumberSelector, LastNameSelector.nextSibling);

        function formatPhoneNumber(inputElement) {
            let value = inputElement.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10); // Limit to 10 numerical characters

            let formattedValue = '';
            if (value.length > 0) formattedValue += '(' + value.slice(0, 3);
            if (value.length > 3) formattedValue += ') ' + value.slice(3, 6);
            if (value.length > 6) formattedValue += '-' + value.slice(6);
            inputElement.value = formattedValue;
        }

        function assignPhoneNumber(phoneNumber) {
            const phoneNumberSplit = phoneNumber.value.replace(/\D/g, '');

            const areaCode = phoneNumberSplit.slice(0, 3);
            const prefix = phoneNumberSplit.slice(3, 6);
            const suffix = phoneNumberSplit.slice(6, 10);

            document.querySelector("#RSAreaCode").value = areaCode ? areaCode : '';
            document.querySelector("#RSPrefix").value = prefix ? prefix : '';
            document.querySelector("#RSSuffix").value = suffix ? suffix : '';

            console.log("-------------------------")
            console.log(document.querySelector("#RSAreaCode").value)
            console.log(document.querySelector("#RSPrefix").value)
            console.log(document.querySelector("#RSSuffix").value)
        }

        // Apply Visuals
        document.querySelector("#newPhoneSelector > label").firstChild.textContent = "Phone Number: "

        const PhoneNumberTextBox = document.querySelector("#newPhoneSelector").querySelector("#RSLastName")
        PhoneNumberTextBox.setAttribute("id", "#RSNewPhone")

        PhoneNumberTextBox.addEventListener('input', function() {
            formatPhoneNumber(this);
            assignPhoneNumber(this);
        });
        formatPhoneNumber(PhoneNumberTextBox);
        assignPhoneNumber(this);
    }
}

// Function to continuously check
function IsResSearchVis() {
    console.log("Running [Topbar Alert]")

    setInterval(() => {
        if (isReservationPanelOpen()) {
            RunResSearch()
        }
    }, 100); // Check every 100ms
}

// Start checking the Reservation Popup visibility
IsResSearchVis();
