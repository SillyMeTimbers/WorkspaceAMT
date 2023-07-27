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

const MsgTemplates = {
    "StorageOffer": {
        Display: "Storage Offer",
        MsgTemplate: `Woohooo storage offers`,
        NoteTemplate: `And notes?? Interesting!!`,

        Params: function () {
            return true
        },
    },

    "Ubox": {
        Display: "Ubox Notice",
        MsgTemplate: `Woohooo ubox offers`,
        NoteTemplate: `And even more notes?? Interesting!!`,

        Params: function () {
            return true
        },
    },

    "ParrellUniverse": {
        Display: "Pow Pow",
        MsgTemplate: `ugh people`,
        NoteTemplate: `changed from yadada to another boop`,

        Params: function () {
            return false
        },
    },

    "EquipmentChange": {
        Display: "Equipment Change",
        MsgTemplate: `Woohooo i no longer have your WANTED equipment so i changed it loolll`,
        NoteTemplate: `changed from yadada to another boop`,

        Params: function () {
            return true
        },
    },
}

function createSubDropdown(id, data) {
    let container = document.createElement('div');
    container.className = "template-container";

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
        current.textContent = data[key].DisplayText;
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

            if (option.value === data[key].DefaultOption) {
                li.className = "selected";
            }

            ul.appendChild(li);
        });
        dropdown.appendChild(ul);
        label.appendChild(dropdown);
        container.appendChild(label);
    }

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

function AddMessageTemplate(n, t) {
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
                        Note Content:

                        <div class="msgBox">
                            <textarea placeholder="Placeholder text" id="noteMessageArea" name="NoteMessage" class="message-textarea"></textarea>
                        </div>

                        <li class="templatesplit" style="opacity: 0;"></li>
                        Message Content:

                        <div class="msgBox">
                            <textarea placeholder="Placeholder text" id="textMessageArea" name="TextMessage" class="message-textarea"></textarea>
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

            head.appendChild(style);
            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            const imageSrc = "https://cdn.discordapp.com/attachments/962895897434394674/1090722644254535760/DynamicMessageColorSlightlyThicker.png";

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
                console.log("Dropdown Changed")
                const DropdownMenu = document.querySelector("#mainTemplateList .msgdropdown")
                const Selected = DropdownMenu.querySelector(".selected").textContent.trim()
                const SubMenu = document.querySelector(".template-indent")
                SubMenu.innerHTML = ``

                console.log(Selected)
                if (Selected == "Equipment Change") {
                    const NewDropdown = createSubDropdown("EquipmentChange", {
                        "OldEquipment": {
                            DisplayText: "Previous Equipment",
                            DefaultOption: "",
                            Options: [
                                { value: "", text: "" },
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
                            DefaultOption: "",
                            Options: [
                                { value: "", text: "" },
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

                        "FreeUpgrade": {
                            DisplayText: "Free Upgrade",
                            DefaultOption: "",
                            Options: [
                                { value: true, text: "Yes" },
                                { value: false, text: "No" },
                            ]
                        },
                    })

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
                    document.querySelector("#mainTemplateList > div > #customCustomerContactList").appendChild(MsgOption)

                    const MsgHiddenValue = new Option(MsgDisplayName, MsgName)
                    MsgHiddenValue.value = MsgData.MsgTemplate
                    MsgHiddenValue.id = `${MsgName}:HiddenValue`
                    document.querySelector("#mainTemplateList > #customCustomerContactTemplateDropdown").appendChild(MsgHiddenValue)
                }
            };

            updateCurrentAnchorText();
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