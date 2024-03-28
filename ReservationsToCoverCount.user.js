// ==UserScript==
// @name         [Functional] ReservationsToCoverCount
// @namespace    http://tampermonkey.net/
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function injectCSS(css) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    const CSSToInject = `

	`;
    injectCSS(CSSToInject);

    const ResCoverSelect = $(`
    <select id="ReservationsToCoverDaysSelect" class="headerSelect" style="margin-left: 5px;">
        <option value="2">2 Days</option>
        <option value="3">3 Days</option>
        <option value="4">4 Days</option>
        <option value="5">5 Days</option>
        <option value="6">6 Days</option>
        <option value="7">7 Days</option>
    </select>
    `);

    function Execute() {
        if ($("#ReservationsToCoverCount").length > 0 && $("#ReservationsToCoverDaysSelect").length <= 0) {
            $("#ReservationsToCoverCount").append(ResCoverSelect)
        }
    }

    function Interval() {
        setInterval(() => {
            Execute()
        }, 100);
    }

    Interval();
})();
