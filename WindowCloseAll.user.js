// ==UserScript==
// @name         [Functional] WindowMenuExitAll
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

    const CloseAllMenu = $(`
        <li>
            <a onclick="javascript:void(0);" data-contractid="dashboard" id="searchCriteria_CloseAll">Close All</a>
        </li>
    `);
    CloseAllMenu.hide()

    function ForceClose(Button) {
        const isClickable = $(Button).find(".close-windows")

        if (isClickable.length) {
            isClickable.click()

            const ConfirmationMsg = $(".wrapper .confirm-modal .primary")
            if (ConfirmationMsg.length) {
                ConfirmationMsg.click()
            }
        }
    }

    CloseAllMenu.click(function (e) {
        e.preventDefault();

        const howManyTabs = $("#windowsOpenedCounter").text()
        ConfirmDialog(`Proceeding will close ${howManyTabs} window(s) and will undo any unsaved changes.`, "Are you sure?", function(r) {
            if (r === !0) {
                const WindowList = $("#windowsDropDownMenu > li")
                WindowList.each(function (index, element) {
                    ForceClose(element)
                })
            }
        })
    });

    function Execute() {
        if (!$("body #searchCriteria_CloseAll").length) {
            $("#windowsDropDownMenu").append(CloseAllMenu)
        }

        const WindowList = $("#windowsDropDownMenu > li")
        $("#windowsOpenedCounter").text(WindowList.length - 3)
        if (WindowList.length >= 4) {
            CloseAllMenu.show()
        } else {
            CloseAllMenu.hide()
        }
    }

    function Interval() {
        setInterval(() => {
            Execute()
        }, 100);
    }

    Interval();
})();
