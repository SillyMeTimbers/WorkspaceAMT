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
function formatDate(inputStr) {
	// Parse input to create Date object
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const match = inputStr.match(/(\w+), (\w+) (\d+), (\d+)(\d+:\d+:\d+ [APMapm]+)/);
	if (!match) return null; // Return null if the input format doesn't match expected

	const date = new Date(`${match[2]} ${match[3]}, ${match[4]} ${match[5]}`);

	// Format day with suffix
	const day = date.getDate();
	let daySuffix = 'th';
	if (day % 10 === 1 && day !== 11) daySuffix = 'st';
	else if (day % 10 === 2 && day !== 12) daySuffix = 'nd';
	else if (day % 10 === 3 && day !== 13) daySuffix = 'rd';

	// Construct output string
	const output = `${months[date.getMonth()]} ${day}${daySuffix}, ${date.getFullYear()} ${date.getHours() % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() < 12 ? 'AM' : 'PM'}`;

	return output;
}

function PaymentTabcalculateTax(amounts, countyTaxRate = 0.0) {
	const stateTaxRate = 0.07;

	let originalTotal = amounts.reduce((acc, amount) => acc + amount, 0);
	let taxAmount = originalTotal * (stateTaxRate + countyTaxRate);
	let totalCost = originalTotal + taxAmount;

	return {
		originalAmounts: parseFloat(originalTotal.toFixed(2)),
		taxAmount: parseFloat(taxAmount.toFixed(2)),
		totalCost: parseFloat(totalCost.toFixed(2))
	};
}

function getDays() {
	const editDaysLink = document.getElementById('editHoursLink');
	if (!editDaysLink) return 1

	const parentElement = editDaysLink.parentElement;

	let daysText = '';

	// Iterate over child nodes of the parent
	for (let child of parentElement.childNodes) {
		// Check if the child node is a text node
		if (child.nodeType === 3) {  // Node.TEXT_NODE is 3
			daysText += child.nodeValue.trim();
		}
	}

	// Parsing logic
	let totalDays = 0;

	// Check for days
	const dayMatch = daysText.match(/(\d+)\s*days?/);
	if (dayMatch) {
		totalDays += parseInt(dayMatch[1]);
	}

	// Check for hours and minutes
	const hourMatch = daysText.match(/(\d+)\s*hrs?/);
	const minMatch = daysText.match(/(\d+)\s*mins?/);

	if (hourMatch || minMatch) {
		let hours = hourMatch ? parseInt(hourMatch[1]) : 0;
		let mins = minMatch ? parseInt(minMatch[1]) : 0;

		if (hours > 0 || mins > 0) {
			totalDays += 1;  // Add an additional day for any fraction of a day
		}
	}

	return totalDays
}

function updatePaymentScreen() {
	const PaymentTabDirec = document.querySelector(`[data-slug="section6"]`);

	if (PaymentTabDirec && !PaymentTabDirec.querySelector("#paymentList")) {
		const PaymentTable = document.querySelector(`[data-slug="section6"]`).querySelector("table");
		let paymentCollected = 0;  // Start with 0 payments as a default

		PaymentTabDirec.innerHTML = '';  // Reset Content

		const Html_Content = `
            <div id="paymentList" class="row">
                <div class="medium-6 columns">
                    <fieldset>
                        <legend>
                            Payment Breakdown (Pure Estimations)
                        </legend>
                        <dl class="inline">
                            <dt>Subtotal:</dt>
                            <dd id="paymentSubtotal">$0.00</dd>
                            <dt>Taxes:</dt>
                            <dd id="paymentEstTaxes">$0.00</dd>
                            <dt>Payments:</dt>
                            <dd id="paymentMade">$0.00</dd>
                            <dt>Estimated Total Cost:</dt>
                            <dd id="paymentAmount">$0.00</dd>
                            <dt>Estimated Total Remaining:</dt>
                            <dd id="paymentEstRemaining">$0.00</dd>
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
			max-height: 400px;
			overflow-y: auto;
			overflow-x: hidden;
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
		const paymentHistoryDiv = document.querySelector("#paymentHistory");

		if (PaymentTable) {  // Check if PaymentHistory table exists
			const PaymentHistory = PaymentTable.cloneNode(true);
			paymentHistoryDiv.appendChild(PaymentHistory);

			$(PaymentHistory).find("tbody tr td:first-child").each(function() {
				$(this).text(formatDate($(this).text()));
			});

			$(PaymentHistory).find("tbody tr td:nth-child(3)").each(function() {
				let amount = Number($(this).text().replace(/[^0-9.-]+/g, ""));
				if (!isNaN(amount)) {
					paymentCollected += amount;
				}
			});

			// Display the payments, even if it's 0
			document.querySelector("#paymentMade").textContent = `$${paymentCollected.toFixed(2)}`;
		} else { // PaymentHistory table doesn't exist
			paymentHistoryDiv.innerHTML = `<p>No payments found.</p>`;
		}

		let subTotal = 0;
		console.log("starting loop")
		$("#reservationEquipmentList:first tr").each(function() {
			console.log($(this).html());
			const RentalRate = Number($(this).find(".RentalRate").text().replace(/[^0-9.-]+/g, ""));
			let RentalQuantity = Number($(this).find(".Quantity").text()) || 1;
			const Model = $(this).find(".Model").text().trim();

			if (Model === "PO") {
				RentalQuantity = RentalQuantity / 12; // Adjust the quantity for "PO" model
			}

			// Get the days to charge using the getDays() function
			const daysToCharge = getDays();

			if (!isNaN(RentalRate)) {
				subTotal += (RentalRate * RentalQuantity * daysToCharge); // Multiply by days to charge
				console.log(`Rate: ${RentalRate}, Quantity: ${RentalQuantity}, Days: ${daysToCharge}`);
			}
		});

		let coverageTotal = 0
		$("#coverageList fieldset").each(function() {
			const CurrentSel = $(this);
			const CurrentCoverage = CurrentSel.find(".inline dd:nth-child(2)").text().trim();
			const FindCost = CurrentSel.find("#coverages");

			// Search for the option that contains the CurrentCoverage text
			const optionText = FindCost.find(`option:contains(${CurrentCoverage})`).text();

			// Extract the price using a regular expression
			let price = 0; // Default to 0
			const priceMatch = optionText.match(/\$(\d+)/);
			if (priceMatch) {
				price = Number(priceMatch[1]);
			}

			coverageTotal += price
		});

		const amounts = [subTotal, coverageTotal];
		let calcTaxResults = PaymentTabcalculateTax(amounts, 0);
		document.querySelector("#paymentSubtotal").textContent = `$${calcTaxResults.originalAmounts.toFixed(2)}`;
		let formattedTaxAmount = `$${calcTaxResults.taxAmount.toFixed(2)}`;
		let infoText = `<small class="info"> (Fixed 7%)</small>`;
		document.querySelector("#paymentEstTaxes").innerHTML = formattedTaxAmount + infoText;
		document.querySelector("#paymentEstTaxes").innerHTML = formattedTaxAmount + infoText;
		document.querySelector("#paymentAmount").textContent = `$${calcTaxResults.totalCost.toFixed(2)}`;
		let remainingAmount = calcTaxResults.totalCost - paymentCollected;
		let formattedAmount;
		if (remainingAmount < 0) {
			formattedAmount = `-$${Math.abs(remainingAmount).toFixed(2)}`;
		} else {
			formattedAmount = `$${remainingAmount.toFixed(2)}`;
		}
		document.querySelector("#paymentEstRemaining").textContent = formattedAmount;
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

	addScriptVersion("Improved Payment Screen", "7")

	setInterval(() => {
		updatePaymentScreen()
	}, 100); // Check every 100ms
}

runPaymentImprovement();
