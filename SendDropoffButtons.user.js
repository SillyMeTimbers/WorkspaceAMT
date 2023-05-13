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
console.log("Started [Send Dropoff Info]")

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

        addButtons();
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
    }
}

// Function to continuously check if the textSubmitForm is visible
function continuouslyCheckTextSubmitFormVisibility() {
    console.log("Running [Send Dropoff Info]")
    
    setInterval(() => {
        if (isDropoffPopupVisible()) {
            console.log("Executing [Send Dropoff Info]")
            runWhenDropoffVisible();
        }
    }, 100);
}

// Start checking the textSubmitForm visibility
continuouslyCheckTextSubmitFormVisibility();
