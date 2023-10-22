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
(function () {
    'use strict';

    let DropOffButtons_LastVisible = false;
    let CSS_StyleSheetAdded = false
    let DropoffPause = false

    function isDropoffPopupVisible() {
        if (!DropoffPause == true) {
            const textSubmitForm = document.querySelector("#SecondaryPopup");
            const TextForumHeader = document.querySelector("#SecondaryPopup > section h1");

            if (TextForumHeader !== null && TextForumHeader.innerHTML == "Send Customer Dropoff Info") {
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

    function runWhenDropoffVisible() {
        DropoffPause = true
        if (DropOffButtons_LastVisible === false) {
            DropOffButtons_LastVisible = true;

            const MessagePopup = waitForElement("Body > #SecondaryPopup", 5000)
            if (MessagePopup) {
                const nMessagePopup = document.querySelector("Body > #SecondaryPopup > section")
                const textPromptSplit = $("#textPrompt").text().trim().split("\n");
                const emailPromptSplit = $("#emailPrompt").text().trim().split("\n");
                const dropPromtReplace = $("#SecondaryPopup .message").text().trim()
                const preDropText = dropPromtReplace.replace("Your dropoff Location is located at ", "");
                
                const ClonePhoneNumber = textPromptSplit.length > 1 ? textPromptSplit[1].trim() : "";
                const CloneEmailAddress = emailPromptSplit.length > 1 ? emailPromptSplit[1].trim() : "";                

                nMessagePopup.innerHTML = `` // Reset Content

                const Html_Content = `
	                <h1 class="header">Send Customer Dropoff Info</h1>

	                <div class="dropoffcontent">
	                    <div class="contactdetails">
                            <label>
                                To view or modify which customer details are sent, use the 'Customer' tab.
                            </label>

                            <p class="message">
                                U-Haul Drop-off Location: ${preDropText}. Use this link to self-return your equipment: <br>
                                <a href="http://uhaul.com/s/500392A9D8" target="_blank">http://uhaul.com/s/500392A9D8</a>
                            </p>

	                        <label>
	                            Phone Number:
	                            <input id="CustomerPhoneNumber" name="CustomerPhoneNumber" type="text" value="${ClonePhoneNumber}" disabled="true" class="phone-input">
	                        </label>

                            <label>
                                Email Address:
                                <input id="CustomerEmailAddress" name="CustomerEmailAddress" type="text" value="${CloneEmailAddress}" disabled="true" class="phone-input">
                            </label>
	                    </div>
	                </div>

	                <div class="dropactionButtons">
	                    <div class="large-12 columns actionButtonsPadding">
                            <button id="dropEmail" type="submit" class="left dropoffButtons" onClick="sendDropoffInfo('email')">Send via Email</button>
                            <button id="dropText" type="submit" class="left dropoffButtons" onClick="sendDropoffInfo('text')">Send via Text</button>
                            <button id="dropEmailText" type="submit" class="left dropoffButtons" onClick="sendDropoffInfo('email_text')">Send via Both E-Mail and Text</button>
	                        <button type="button" class="right secondary custom-close-reveal">Cancel</button>
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

                if (CloneEmailAddress.length < 1) {
                    $("#dropEmail").prop("disabled", true);
                    $("#dropEmailText").prop("disabled", true);
                }
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
