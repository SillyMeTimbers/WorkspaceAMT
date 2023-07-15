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

function MessageTextForumVisible() {
    if (MessageTemplateLastVisible === false) {
        MessageTemplateLastVisible = true;
        console.log("Prompted")

        const MessagePopup = waitForElement("Body > #SecondaryPopup > #textSubmitForm", 5000)
        if (MessagePopup) {
            document.querySelector("Body > #SecondaryPopup").style.borderRadius = '10px';

            setTimeout(() => {
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
                            <input id="CustomerPhoneNumber" name="CustomerPhoneNumber" type="text" value="(999) 999-9999" class="phone-input">
                        </label>
                
                        <li class="templatesplit"></li>

                        <label class="template-label">
                            Create Template:
                
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

                        <button type="button" class="right msgcorner templateadd" onclick="">Add Template</button>
                    </div>
                
                    <div class="msgright">
                        Message Content:

                        <div class="msgBox">
                            <textarea placeholder="Text message go here..." id="textMessageArea" name="TextMessage" class="message-textarea"></textarea>
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
                    flex-grow: 1;
                    display: flex;
                    padding-top: 5px;
                }
                
                .msgright .msgBox textarea {
                    flex-grow: 1;
                    resize: none;
                    border-radius: 5px;
                    height: 100%;
                    min-height: 10em;
                    border-radius: 5px;
                    margin-bottom: 0px !important;
                    margin-top: 0px !important;
                }                                      
            
                .template-label {
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
                
                .msgleft .templatesplit {
                  border-bottom: none;
                  border-top: solid 1px #d6d6d6;
                  clear: both;
                  width: 100%;
                  padding-bottom: 10px;
                }

                .msgleft .templatesplit::marker {
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

                head.appendChild(style);
                style.type = 'text/css';
                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }
            }, 100);
        } else {
            console.log("no load ;(")
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

    addScriptVersion("Dynamic Messages", "1")

    setInterval(() => {
        if (isMessageTextForumVisible()) {
            MessageTextForumVisible();
        }
    }, 100); // Check every 100ms
}

isMessageTextForumVisibleInterval();
