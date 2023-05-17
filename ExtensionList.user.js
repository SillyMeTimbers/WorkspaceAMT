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

async function extensionButtonWaitForElement(selector, timeout = 10000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const element = document.querySelector(selector);

        if (element) {
            console.log(element)
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
        categoryCell.colSpan = 4;
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
                "TCM - Angel Vega": [true, "781301"],
                "RDM - Rick Ruiz": [false, "781302"],
                "RM - Joshua McCart": [false, ""],
                "RM - Michelle Asker": [false, ""],
                "RM - Melissa Wise": [false, ""],
                "RM - Julianna Mayes": [false, ""],
				"RM - Nyla Whitty": [false, ""],
				"RM - Emily Bertrand": [false, ""],
				"RM - Sheryse McKenzie": [false, ""],
				"RM - Wilson Burgos": [false, ""],
				"RM - Matthew Glenn": [false, ""],
				"RM - Daviena Wallace": [false, ""],
            },
			
			"District 12 Extensions": {
                "MCO 753 (UHC of Clearwater)": [false, "753300", "727-288-9919"],
                "MCO 781 (UHC of Eastern Florida)": [false, "781300", "561-638-9428"],
                "MCO 786 (UHC of West Tampa)": [false, "786300", "813-247-5016"],
                "MCO 787 (UHC of Miami)": [false, "787300", "305-756-4639"],
                "MCO 788 (UHC of Ft Lauderdale)": [false, "788300", "954-942-1101"],
                "MCO 830 (UHC of Western Florida)": [false, "830300", "941-359-2413"],
				"MCO 955 (UHC of East Tampa/Lakeland)": [false, "955300", "813-655-4434"],
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
			
			"Extensions Outside Contact Center": {
                "Advertising": [false, "623802"],
				"Alarm Room - Warm Transfer Required": [false, "607112", "800-238-4364"],
				"Boxes (Buyers Club)": [false, "691904"],
				"Boxes (help w/New & Existing Boxes/Moving Order Supplies": [false, "", "800-269-6737"],
				"Center/Dealer Operations": [false, "571200"],
				"Collections (Customer Owes U-Haul Money) - 7:30am - 4:00pm": [true, "612906"],
				"Computer Support (MCOs, Centers, Dealers)": [false, "606901", "866-846-9927"],
				"Credit Administration": [false, "612535", "800-345-5876"],
				"CSS / Agent Support": [false, "606903"],
				"Donation Request (req for U-Haul to doante Money, Equipment, Etc": [false, "623801"],
				"E-Alerts (stops customers from renting equipment due to money owed, etc": [true, "620903"],
				"Employment Verification": [false, "605020"],
				"Equipment Recovery (abandonded equipment) - Warm Transfer Required": [true, "571200"],
				"Fleet Sales (buy U-Haul Equipment, Trucks Only*), 6:00am - 6:00pm": [false, "672902", "866-404-0355"],
				"Operator (U-Haul Towers Switchboard)": [false, "618010", "800-528-0463"],
				"Republic Claims - REP West (U-Haul Insurance)": [false, "800-528-7134"],
				"Tech Center": [false, "", "800-223-6218"],
				"Truck - Side Signs (rent U-Haul truck/advertise your business on the side)": [false, "", "877-UHI-SIGN"],
				"U-Car Share": [false, "618907", "877-990-8227"],
				"Vendor Request (request to sell U-Haul a product/service refer online)": [false, "uhaul.com/purchasing"],
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
        CloseSecondaryPopup()
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

        if (document.querySelector("body > div.wrapper > #SendAppToCustomerPopup")) {
            document.querySelector("body > div.wrapper > #SendAppToCustomerPopup").innerHTML = ``
        }
    }, 100); // Check every 100ms
}

// Start checking the Reservation Popup visibility
shouldAddExtensionListButton();
