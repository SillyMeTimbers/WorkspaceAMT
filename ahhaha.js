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
let CSS_StyleSheetAdded = false
let DropoffPause = false

function isDropoffPopupVisible() {
    if (!DropoffPause == true) {
        const textSubmitForm = document.querySelector("#SecondaryPopup");
        const TextForumHeader = document.querySelector("#SecondaryPopup > section > header > h1");

        if (TextForumHeader !== null && TextForumHeader.innerHTML == "Send Customer Dropoff Info") {
            if (
                textSubmitForm &&
                textSubmitForm.offsetWidth > 0 &&
                textSubmitForm.offsetHeight > 0
            ) {
                $("#SecondaryPopup").css({
                    width: `50%`,
                    left: `75%`,
                })

                return true;
            }
        }

        if (DropOffButtons_LastVisible) {
            console.log("reset")
            $("#SecondaryPopup").css({
                width: ``,
                left: ``,
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
    if (DropOffButtons_LastVisible === false) {
        DropOffButtons_LastVisible = true;

        const MessagePopup = waitForElement("Body > #SecondaryPopup", 5000)
        if (MessagePopup) {
            //const ClonePhoneNumber = document.querySelector("#textSubmitForm label").textContent.trim().split(" ")[1]
            const nMessagePopup = document.querySelector("Body > #SecondaryPopup > section")
            nMessagePopup.innerHTML = `` // Reset Content

	            const Html_Content = `
	                <h3 class="header">Send Customer Dropoff Info</h3>

	                <div class="messagecontent custom form">
	                    <div class="msgleft">
	                        <label class="phonenumber-label">
	                            Phone Number:
	                            <input id="CustomerPhoneNumber" name="CustomerPhoneNumber" type="text" value="${9999999999}" disabled="true" class="phone-input">
	                        </label>

	                        <li class="templatesplit"></li>

	                        <label class="msgList" id="mainTemplateList">
	                            Create Template:

	                            <select id="customCustomerContactTemplateDropdown" name="GetCustomCustomerContactTemplate" class="hidden-field">

	                            </select>

	                            <div class="custom dropdown msgcorner">
	                                <a href="#" class="current">Failed to load templates</a>
	                                <a href="#" class="selector"></a>

	                                <ul class="msgdropdown" id="customCustomerContactList">

	                                </ul>
	                            </div>
	                        </label>

	                        <div class="template-indent">
	                        </div>

	                        <button type="button" class="right msgcorner templateadd" onclick="AddMessageTemplate($('#mainTemplateList #customCustomerContactTemplateDropdown'), $('#textMessageArea'))">Add Template</button>
	                    </div>

	                </div>

	                <div class="actionButtons">
	                    <div class="large-12 columns">
	                        <button type="submit" class="right save msgcorner">Send</button>
	                        <button type="button" class="right cancel msgcorner" onclick="CloseModalPopup()">Cancel</button>
	                    </div>
	                </div>
	            `
                DropoffPause = true
            nMessagePopup.innerHTML = Html_Content;
            DropoffPause = false

            var css = `
	                .header {
	                    /*
			    border-top-right-radius: 5px;
	                    border-top-left-radius: 5px;
			    */
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
	                    /* border-radius: 5px; */
	                    height: 100%;
	                    margin-bottom: 0px !important;
	                    margin-top: 0px !important;
	                }

	                .msgList {
	                    margin-bottom: 20px;
	                }

	                .phone-input {
	                    /* border-radius: 5px; */
	                }

	                .msgcorner {
	                    /* border-radius: 5px; */
	                }

	                .dropdownpad {
	                    margin-bottom: 1.6666666667em !important;
	                    border: 1px solid #ccc;
	                }

	                .customcheckbox {
	                    margin-top: 12px !important;
	                    height: 1em !important;
	                }

		  	.msgleft .checkbox.custom {
	                    top: 0px !important;
	                    height: 100%;
			    width: 100%;
	                }

	                .msgdropdown {
	                    /* border-radius: 5px; */
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
        }
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

    addScriptVersion("Dropoff Buttons", "Testing")

    setInterval(() => {
        if (isDropoffPopupVisible()) {
            runWhenDropoffVisible();
        }
    }, 100);
}

// Start checking the textSubmitForm visibility
continuouslyCheckTextSubmitFormVisibility();
