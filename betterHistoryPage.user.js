// ==UserScript==
// @name         [Experimental] betterHistoryPage
// @namespace    http://tampermonkey.net/
// @description  Custom template for message templates
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==

let paymentCSS_StyleSheetAdded = false
function getOrdinal(n) {
    var s = ["th", "st", "nd", "rd"],
        v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function convertDateFormat(s) {
    if (!s.startsWith('Pick up date/time changed') && !s.startsWith('Due date/time changed')) {
        return s; // Return the original string if it doesn't match the expected prefixes
    }

    // Extract the last date and time from the string
    const dateStr = s.split('to ')[1].split(' ')[0];
    const timeStr = s.split('to ')[1].split(' ')[1];

    const year = parseInt(dateStr.split('-')[0]);
    const month = parseInt(dateStr.split('-')[1]) - 1; // Months are 0-indexed in JS
    const day = parseInt(dateStr.split('-')[2]);

    const hours = parseInt(timeStr.split(':')[0]);
    const minutes = parseInt(timeStr.split(':')[1]);

    // Create a Date object using extracted parts
    const dateObj = new Date(year, month, day, hours, minutes);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedStr = `${monthNames[dateObj.getMonth()]} ${getOrdinal(dateObj.getDate())}, ${dateObj.getFullYear()} ${dateObj.getHours() % 12 || 12}:${(dateObj.getMinutes() < 10 ? '0' : '') + dateObj.getMinutes()} ${dateObj.getHours() >= 12 ? 'PM' : 'AM'}`;

    // Determine event type (Pick up or Due)
    const eventType = s.includes('Pick up') ? 'Pick up' : 'Due';

    return `${eventType} date/time changed to ${formattedStr}`;
}

function updateHistoryScreen() {
    const HistoryTableDirec = document.querySelector(`[data-slug="section7"]`);

    if (HistoryTableDirec) {

        var css = `
.tooltip-content {
    display: none;
    position: absolute;
    font-weight: normal;
    font-size: 1em;
    light-height: 1.3;
    border: solid 1px #cccccc;
    color: #555;
    background: #fff;
    border-radius: 3px;
    pointer-events: none; /* Add this line */
    padding: 5px 10px;
    transition: opacity 0.3s;  /* Transition for fade effect */
}

.tooltip-wrapper:hover .tooltip-content {
    display: block;
}

            `,
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        if (!paymentCSS_StyleSheetAdded) {
            paymentCSS_StyleSheetAdded = true;

            head.appendChild(style);
            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
        }

        const HistoryData = HistoryTableDirec.querySelector("table")
$(`[data-slug="section7"] table tr`).each(function() {
    if ($(this).attr("sorted") != "true") {
        let Response = $(this).find("td:nth-child(4)");

        let previousDate = Response.text().split(' to ')[0].split('changed from ')[1];
        let formattedDate = convertDateFormat(Response.text());

        // Create tooltip structure
        let tooltipContent = $('<span class="tooltip-content"></span>').text('Previous: ' + previousDate);
        let tooltipWrapper = $('<div class="tooltip-wrapper"></div>').append(formattedDate, tooltipContent);

        Response.empty().append(tooltipWrapper);

        $(this).attr("sorted", "true");
    }
});

// Mouse events for fade-in and fade-out
$(`[data-slug="section7"] table`).on('mouseenter', '.tooltip-wrapper', function() {
    $(this).find('.tooltip-content').fadeIn(300);  // Fade in over 300ms
}).on('mouseleave', '.tooltip-wrapper', function() {
    $(this).find('.tooltip-content').fadeOut(300); // Fade out over 300ms
});
    }
}

// Function to continuously check if the textSubmitForm is visible
function runPaymentImprovement() {
    function addScriptVersion(scriptName, version) {
        let scriptVersionElement = document.createElement('div');
        scriptVersionElement.style.display = 'none'; // Make it hidden
        scriptVersionElement.classList.add('script-version'); // So we can find it later
        scriptVersionElement.dataset.name = scriptName; // Store the script name
        scriptVersionElement.dataset.version = version; // Store the version
        document.body.appendChild(scriptVersionElement);
    }

    addScriptVersion("Improved History Screen", "1")

    setInterval(() => {
        updateHistoryScreen()
    }, 100); // Check every 100ms
}

runPaymentImprovement();
