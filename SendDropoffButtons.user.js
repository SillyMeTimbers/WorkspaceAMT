// ==UserScript==
// @name         [Functional] Send Dropoff Info Buttons
// @namespace    http://tampermonkey.net/
// @version      5.10.818A
// @description  Improved buttons to send Dropoff Information
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==
// Variables
let DropOffButtons_LastVisible = false;

function isDropoffPopupVisible() {
    const textSubmitForm = document.querySelector("#SecondaryPopup");
    const TextForumHeader = document.querySelector("#SecondaryPopup > section > header > h1");

    if (TextForumHeader !== null && TextForumHeader.innerHTML == "Send Customer Dropoff Info") {
        if (
            textSubmitForm &&
            textSubmitForm.offsetWidth > 0 &&
            textSubmitForm.offsetHeight > 0
        ) {
            return true;
        }
    }

    DropOffButtons_LastVisible = false;
    return false;
}

function runWhenDropoffVisible() {
    if (DropOffButtons_LastVisible === false) {
        DropOffButtons_LastVisible = true;

        function createButton(id, text, email, sms) {
            const button = document.createElement('button');
            button.id = id;
            button.className = 'left schedulebutton';
            button.type = 'button';
            button.innerText = text;
            button.onclick = function(event) {
                ScheduleNowSendMessage(event, email, sms);
            };
            return button;
        }

        function addButtons() {
            const targetElement = document.querySelector('#SecondaryPopup > section > div:nth-child(4) > div.large-12.columns');

            targetElement.innerHTML = '';

            const emailButton = createButton('scheduleSendEmailBtn', 'Send E-Mail', true, false);
            const textButton = createButton('scheduleSendTextBtn', 'Send Text', false, true);
            const emailAndTextButton = createButton('scheduleSendEmailAndTextBtn', 'Send E-Mail and Text', true, true);

            targetElement.appendChild(emailButton);
            targetElement.appendChild(textButton);
            targetElement.appendChild(emailAndTextButton);
        }

        // Remove Send Buttons
        const emailPrompt = document.getElementsByClassName('primary right emailPrompt');
        for (let i = 0; i < emailPrompt.length; i++) {
            emailPrompt[i].remove();
        }

        const textPrompt = document.getElementsByClassName('primary right textPrompt');
        for (let i = 0; i < textPrompt.length; i++) {
            textPrompt[i].remove();
        }

        const email_textPrompt = document.getElementsByClassName('primary right email_textPrompt');
        for (let i = 0; i < email_textPrompt.length; i++) {
            email_textPrompt[i].remove();
        }

        addButtons(); // Keep only this call to addButtons()
        $('#emailPrompt').show();
        $('#textPrompt').show();
        function ScheduleNowSendMessage(event, sendEmail, sendText) {
            if (sendEmail && sendText) {
                sendDropoffInfo("email_text")
            } else {
                if (sendEmail) {
                    sendDropoffInfo("email")
                }

                if (sendText) {
                    sendDropoffInfo("text")
                }
            }
        }


        const phoneNumberInput = document.querySelector("#customerPhoneNumber");
        const emailInput = document.querySelector("#customerEmail");

        function validateInputs() {
            const phoneNumber = phoneNumberInput.value.replace(/\D/g, '');
            const email = emailInput.value.toLowerCase();
            const phoneNumberValid = phoneNumber.length === 10;
            const validExtensions = ['.com', '.org', '.edu', '.net'];
            const emailValid = email.match(/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/) !== null && validExtensions.some(extension => email.endsWith(extension));
            const bothValid = phoneNumberValid && emailValid;

            document.querySelector('#scheduleSendEmailBtn').disabled = !emailValid;
            document.querySelector('#scheduleSendTextBtn').disabled = !phoneNumberValid;
            document.querySelector('#scheduleSendEmailAndTextBtn').disabled = !bothValid;
        }

        function waitForElement(selector, callback) {
            const observer = new MutationObserver((mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        const element = document.querySelector(selector);
                        if (element) {
                            observer.disconnect();
                            callback(element);
                        }
                    }
                }
            });

            observer.observe(document.body, { attributes: false, childList: true, subtree: true });
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

        phoneNumberInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });

        formatPhoneNumber(phoneNumberInput); // Call the function initially to format the value

        phoneNumberInput.addEventListener('input', validateInputs);
        emailInput.addEventListener('input', validateInputs);
        validateInputs();
    }
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

    addScriptVersion("Dropoff Buttons", "1")
    
    setInterval(() => {
        if (isDropoffPopupVisible()) {
            console.log("Executing [Send Dropoff Info]")
            runWhenDropoffVisible();
        }
    }, 100);
}

// Start checking the textSubmitForm visibility
continuouslyCheckTextSubmitFormVisibility();
