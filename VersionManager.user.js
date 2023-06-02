// ==UserScript==
// @name         Script Versions
// @namespace    http://tampermonkey.net/
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==
let NameLastVisible = false;

function RunVersionList() {
    if (NameLastVisible == false) {
        NameLastVisible = true;

        // Create the dropdown
        let dropdown = document.createElement('ul');
        dropdown.id = 'versionDropdown';
        dropdown.style.display = 'none'; // Start out hidden
        dropdown.style.position = 'absolute'; // Positioning relative to the hovered element
        dropdown.style.backgroundColor = 'white'; // So it's visible against any background
        dropdown.style.listStyle = 'none'; // No bullets
        dropdown.style.padding = '10px'; // 10 pixels padding
        dropdown.style.borderRadius = '10px'; // Rounded corners
        dropdown.style.marginTop = '10px'; // Space below the username
        dropdown.style.border = '1.5px solid #c3c3c3'; // 1px red border

        // Append the dropdown to the body
        document.body.appendChild(dropdown);

        // Reference to user element
        let userElement = document.querySelector("#Header > nav > section > ul.right > li.user");

        // Show the dropdown when we hover over the specified element
        userElement.addEventListener('mouseenter', (event) => {
            // Update the dropdown items
            while (dropdown.firstChild) dropdown.removeChild(dropdown.firstChild);

            let scriptVersionElements = document.querySelectorAll('.script-version');
            if (scriptVersionElements.length === 0) {
                // If there are no script versions, do not show the dropdown
                return;
            }

            for (let scriptVersionElement of scriptVersionElements) {
                let item = document.createElement('li');
                item.textContent = scriptVersionElement.dataset.name + ': ' + scriptVersionElement.dataset.version;
                dropdown.appendChild(item);
            }

            // Position the dropdown under the username
            let rect = userElement.getBoundingClientRect();
            dropdown.style.left = rect.left + 'px';
            dropdown.style.top = (rect.top + rect.height + window.scrollY) + 'px';
            dropdown.style.display = 'block'; // Show the dropdown
        });

        // Hide the dropdown when we stop hovering over the element
        userElement.addEventListener('mouseleave', () => {
            dropdown.style.display = 'none';
        });
    }
}

// Function to continuously check
function IsNameElementVisible() {
    setInterval(() => {
        if (document.querySelector("#Header > nav > section > ul.right > li.user")) {
            RunVersionList()
        }
    }, 100); // Check every 100ms
}

// Start checking the Reservation Popup visibility
IsNameElementVisible();
