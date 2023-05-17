// ==UserScript==
// @name         [Functional] List of Extensions
// @namespace    http://tampermonkey.net/
// @version      no
// @description  Shows full list of company extensions
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==
console.log("Started [Extension Sheet]")

// function addIsPrepaidDivToReservationPopup(targetElement, position) {
//     const isPrepaidDivId = 'isPrepaidDiv';
//     let isPrepaidDiv = document.querySelector(`#${isPrepaidDivId}`);
//     const isPersonInContract = document.querySelector('.whoseViewingStatus:not(#isPrepaidDiv)');

//     if (!isPrepaidDiv) { // Create first time
//         isPrepaidDiv = document.createElement('div');
//         isPrepaidDiv.classList.add('whoseViewingStatus');
//         isPrepaidDiv.dataset.contractid = '518120053';
//         isPrepaidDiv.style.display = 'block';
//         isPrepaidDiv.textContent = displayText;
//         isPrepaidDiv.id = isPrepaidDivId;
//         isPrepaidDiv.style.backgroundColor = '#bd362f'; // Set the background color to #bd362f
//         isPrepaidDiv.style.color = 'white'; // Set the text color to white
//         isPrepaidDiv.style.margin = '-1em 0 0.5em'
//         targetElement.insertBefore(isPrepaidDiv, targetElement.firstChild);
//     } else {
//         isPrepaidDiv.textContent = displayText; // Update the text of the isPrepaidDiv element
//         isPrepaidDiv.style.backgroundColor = '#bd362f'; // Set the background color to #bd362f
//         isPrepaidDiv.style.color = 'white'; // Set the text color to white

//         if (isPersonInContract.style.display !== "block") {
//             targetElement.insertBefore(isPrepaidDiv, targetElement.firstChild);
//             isPrepaidDiv.style.margin = '-1em 0 0.5em'
//         } else {
//             isPersonInContract.insertAdjacentElement('afterend', isPrepaidDiv);
//             isPrepaidDiv.style.margin = '-.5em 0 0.5em'
//         }
//     }
// }

async function extensionButtonWaitForElement(selector, timeout = 10000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const element = document.querySelector(selector);

        if (element) {
            return element;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Return null if the element is not found within the timeout period
    return null;
}

function createGrid(data) {
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = "calc(100% - 20px)";
    table.style.border = '1px solid black';
    table.style.margin = "0 auto"
    table.style.marginBottom = "10px"

    for (const category in data) {
        const categoryRow = document.createElement('tr');
        const categoryCell = document.createElement('td');
        categoryCell.colSpan = 3;
        categoryCell.textContent = category;
        categoryCell.style.backgroundColor = '#f2f2f2';
        categoryCell.style.fontWeight = 'bold';
        categoryCell.style.border = '1px solid black';
        categoryRow.appendChild(categoryCell);
        table.appendChild(categoryRow);

        for (const name in data[category]) {
            const item = data[category][name];
            const row = document.createElement('tr');

            if (item[0] === true) {
                row.style.backgroundColor = "#eaea00"
            };

            const nameCell = document.createElement('td');
            nameCell.textContent = name;
            nameCell.style.border = '1px solid black';
            row.appendChild(nameCell);

            const extensionCell = document.createElement('td');
            extensionCell.textContent = item[1] || '-';
            extensionCell.style.border = '1px solid black';
            row.appendChild(extensionCell);

            const phoneCell = document.createElement('td');
            phoneCell.textContent = item[2] || '-';
            phoneCell.style.border = '1px solid black';
            row.appendChild(phoneCell);

            const partyExtension = document.createElement('td');
            partyExtension.textContent = item[3] || '-';
            partyExtension.style.border = '1px solid black';
            row.appendChild(partyExtension);

            table.appendChild(row);
        }
    }
    return table;
}

async function ExtensionListHandler() {
    await extensionButtonWaitForElement("#SendAppToCustomerPopup", 30000);
    const Popup = document.querySelector("#SendAppToCustomerPopup");

    if (Popup) {
        Popup.classList.add("ExtensionList")
        console.log("Open Popup");

        // Update Visuals
        const headerElement = await extensionButtonWaitForElement("#form0 > header > h1", 3e3);
        if (headerElement) {
            headerElement.textContent = "Extension List";
        } else {
            console.error("Could not find the header element");
        }

        // Remove the form div
        const formDiv = await extensionButtonWaitForElement("#form0 > div", 3e3);
        if (formDiv) {
            formDiv.remove();
        } else {
            console.error("Could not find the form div");
        }

        // Create and insert the grid
        const data = {
            "Traffic Extensions": {
                "Angel Vega": [true, "781301"],
                "Rick Ruiz": [false, "781302"],
                "Joshua McCart": [false, "781313"],
                "Michelle Asker": [false, "781304"],
                "Mellisa Wise": [false, "781305"],
                "Julianna Mayes": [false, "781306"],
            },

            "Contact Center Departmental Extensions": {
                "ADA Line (Services for Customers with Disabilities)": [false, "502166"],
                "Callback Team": [false, "621907", "800-664-5017"],
                "Spanish Callback Team": [false, "621926", "800-664-5017"],
                "College U-Boxes": [false, "621929"],
                "U-Box Support": [false, "620993"],
                "U-Box Sales": [false, "621919", "877-468-4285"],
                "Field Support / Center & Dealer Rate Line": [false, "621914", "800-248-4285"],
                "French Speaking (Sales & Center Support)": [false, "621946"],
                "Spanish Speaking (Sales & Center Support)": [true, "621902"],
                "Hitch Central - Internal Use Only, Do NOT transfer customers": [false, "672901"],
                "Hitch Sales": [false, "621979"],
                "Corporate Accounts | 5:00am - 8:00pm": [false, "621911", "800-528-6042"],
                "Center Support": [false, "620992"],
                "Customer Service": [true, "620911", "800-789-3638"],
                "Manager On Duty (MOD) - Sales & Center Support - Warn Transfer Required": [false, "500190"],
                "Manager On Duty (MOD) - Customer Service - Warn Transfer Required": [false, "502190"],
                "Roadside Assistance": [true, "620902", "800-528-0355"],
                "Truckshare 24/7, Customer Return or Live Verify Assistance": [true, "502901"],
                "Equipment Distribution": [false, "", "866-323-4348", "1"],
            },
        };
        const grid = createGrid(data);
        const formElement = document.querySelector('#form0');
        formElement.appendChild(grid);
    }
}

function createExtensionButton() {
    const SendCXAppButton = document.querySelector("#Header > nav > section > ul.left > li.has-tip")
    const ExtensionListButton = SendCXAppButton.cloneNode(true)
    const ExtensionListIcon = ExtensionListButton.querySelector('.fa.fa-mobile.applink-icon');
    ExtensionListButton.classList.remove("has-tip")
    ExtensionListButton.classList.add("extension-button")
    SendCXAppButton.parentElement.insertBefore(ExtensionListButton, SendCXAppButton.nextSibling);

    // Update Button Visual
    ExtensionListButton.querySelector("a > span.applink-text").textContent = "Extensions List"
    ExtensionListIcon.classList.remove('fa-mobile'); // Remove the previous icon class
    ExtensionListIcon.style.backgroundImage = 'url("https://cdn.discordapp.com/attachments/962895897434394674/1108155815526932531/ExtensionListIcon.png")';
    ExtensionListIcon.style.backgroundSize = 'cover'; // Add this line to adjust the background image size
    ExtensionListIcon.style.width = '25px'; // Adjust the width of the icon element
    ExtensionListIcon.style.height = '25px'; // Adjust the height of the icon element

    // Remove the inline onclick event handler
    const anchorElement = ExtensionListButton.querySelector(".applink-anchor");
    anchorElement.removeAttribute("onclick");

    // Add the new event listener
    anchorElement.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevent the event from bubbling up to parent elements
        OpenSendAppToCustomer(); // Call the original function
        ExtensionListHandler();
    });
}

// Function to continuously check
function shouldAddExtensionListButton() {
    console.log("Running [Extension Sheet]")

    setInterval(() => {
        const SendCXAppButton = document.querySelector("#Header > nav > section > ul.left > li.has-tip")
        const ExtensionButton = document.querySelector("#Header > nav > section > ul.left > li.extension-button")

        if (SendCXAppButton && !ExtensionButton) {
            createExtensionButton();
        }
    }, 100); // Check every 100ms
}

// Start checking the Reservation Popup visibility
shouldAddExtensionListButton();
