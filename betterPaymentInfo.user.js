// ==UserScript==
// @name         [Experimental] betterPaymentInfo
// @namespace    http://tampermonkey.net/
// @description  Custom template for message templates
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==

let paymentCSS_StyleSheetAdded = false
function updatePaymentScreen() {
    const PaymentTabDirec = document.querySelector(`[data-slug="section6"]`)

    if (PaymentTabDirec &&! PaymentTabDirec.querySelector("#paymentList")) {
        const PaymentHistory = document.querySelector(`[data-slug="section6"]`).querySelector("table").cloneNode(true)
        PaymentTabDirec.innerHTML = `` // Reset Content

        const Html_Content = `
            <div id="paymentList" class="row">
                <div class="medium-6 columns">
                    <fieldset>
                        <legend>
                            Payment Breakdown (Sorta)
                        </legend>
                        <dl class="inline">
                            <dt>Subtotal:</dt>
                            <dd>$0.00</dd>
                            <dt>Taxes:</dt>
                            <dd>$0.00</dd>
                            <dt>Payments:</dt>
                            <dd>$0.00</dd>
                            <dt>Prepaid Amount:</dt>
                            <dd>$0.00</dd>
                            <dt>Estimated Total Remaining:</dt>
                            <dd>$0.00</dd>
                        </dl>
                    </fieldset>
                </div>
                <div class="medium-6 columns">
                    <fieldset>
                        <legend>
                            Payment History
                        </legend>
                        
                        <div id="paymentHistory"></div>
                    </fieldset>
                </div>
            </div>
        `
        PaymentTabDirec.innerHTML = Html_Content;

        var css = `
            #paymentHistory {
                margin-bottom: 10px;
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

        // Scripts :)
        const paymentHistoryDiv = document.querySelector("#paymentHistory")
        paymentHistoryDiv.appendChild(PaymentHistory)
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

    addScriptVersion("Improved Payment Screen", "1")

    setInterval(() => {
        updatePaymentScreen()
    }, 100); // Check every 100ms
}

runPaymentImprovement();
