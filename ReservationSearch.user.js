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

function NextFieldResSearch(n, t) {
    n.value.length >= n.maxLength && ($("#RSAreaCode").val() === "" ? ($("#RSPrefix, #RSSuffix").attr("readonly", !0),
    $("#RSPrefix, #RSSuffix").val("")) : $("#RSPrefix").attr("readonly", !1),
    $("#RSPrefix").val() === "" ? ($("#RSSuffix").attr("readonly", !0),
    $("#RSSuffix").val("")) : $("#RSSuffix").attr("readonly", !1),
    $("#RSPrefix").val() === "" && $("#RSFirstName").val() === "" && $("#RSLastName").val() === "" && $("#RSPrefix").val() === "" && $("#RSCreditCardNumber").val() === "" ? UpdateBoolsForSearch(!1) : UpdateBoolsForSearch(!0)
)}

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
            if (!inputElement || !inputElement.value) {
                return
            }

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

            const AreaCode = document.querySelector("#RSAreaCode")
            const AreaPrefix = document.querySelector("#RSPrefix")
            const AreaSuffix = document.querySelector("#RSSuffix")

            const areaCode = phoneNumberSplit.slice(0, 3);
            const prefix = phoneNumberSplit.slice(3, 6);
            const suffix = phoneNumberSplit.slice(6, 10);

            AreaCode.value = areaCode ? areaCode : '';
            AreaPrefix.value = prefix ? prefix : '';
            AreaSuffix.value = suffix ? suffix : '';

            if (AreaCode.value.length == 3 && AreaPrefix.value.length >= 1) {
                console.log("AreaCode at 3")
            }

            if (AreaCode.value.length == 3 && AreaPrefix.value.length == 3) {
                console.log("AreaPrefix at 3")
                $("#RSDateFrom, #RSDateTo").prop("disabled", true);
                UpdateBoolsForSearch(true);
                console.log("disable")
            } else {
                $("#RSDateFrom, #RSDateTo").prop("disabled", false);
                UpdateBoolsForSearch(false);
                console.log("enable")
            }

            console.log("-------------------------")
            console.log(AreaCode.value)
            console.log(AreaPrefix.value)
            console.log(AreaSuffix.value)
        }

        // Apply Visuals
        document.querySelector("#newPhoneSelector > label").firstChild.textContent = "Phone Number: "

        const PhoneNumberTextBox = document.querySelector("#newPhoneSelector").querySelector("#RSLastName")
        PhoneNumberTextBox.setAttribute("id", "#RSNewPhone")

        formatPhoneNumber(PhoneNumberTextBox);
        assignPhoneNumber(PhoneNumberTextBox);

        PhoneNumberTextBox.addEventListener('input', function() {
            formatPhoneNumber(this);
            assignPhoneNumber(this);
        });

        PhoneNumberTextBox.addEventListener('change', function() {
            formatPhoneNumber(this);
            assignPhoneNumber(this);
        });

        PhoneNumberTextBox.addEventListener('keypress', function(keyInput) {
            if (keyInput.which === 13) {
                $("#form0 > section > div > div.row > div:nth-child(2) > button.save.right").click();
            }
        });
    }
}

// Function to continuously check
function IsResSearchVis() {
    function addScriptVersion(scriptName, version) {
        let scriptVersionElement = document.createElement('div');
        scriptVersionElement.style.display = 'none'; // Make it hidden
        scriptVersionElement.classList.add('script-version'); // So we can find it later
        scriptVersionElement.dataset.name = scriptName; // Store the script name
        scriptVersionElement.dataset.version = version; // Store the version
        document.body.appendChild(scriptVersionElement);
    }

    addScriptVersion("Reservation Lookup", "2")

    setInterval(() => {
        if (isReservationPanelOpen()) {
            RunResSearch()
        }
    }, 100); // Check every 100ms
}

// Start checking the Reservation Popup visibility
IsResSearchVis();
