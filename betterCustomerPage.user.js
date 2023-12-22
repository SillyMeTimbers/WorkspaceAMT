// ==UserScript==
// @name         [Experimental] betterCustomerPage
// @namespace    http://tampermonkey.net/
// @description  Custom template for message templates
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==

(function () {
	'use strict';
	let historyCSS_StyleSheetAdded = false
	function getOrdinal(n) {
		var s = ["th", "st", "nd", "rd"],
			v = n % 100;
		return n + (s[(v - 20) % 10] || s[v] || s[0]);
	}

	function injectCSS(css) {
		const style = document.createElement('style');
		style.type = 'text/css';
		style.appendChild(document.createTextNode(css));
		document.head.appendChild(style);
	}

	const CSSToInject = `
		#CustomerInformationTable tbody:nth-of-type(even) {
			background: #f1f1f1;
		}

		#CustomerInformationTable {
			border: 0px;
		}

		#CustomerInformationTable span {
			margin: 2px;
		}

		.inputbuttons {
			margin: 0px !important;
		}

		.inputbuttons > button {
			margin-right: 10px !important;
		}

		.customerInfo {
			margin: 0px !important;
		}

		.splitinfo {
			display: flex;
		}

		.splitinfo > div {
			width: calc(33.3% - 5px)
		}
		.splitinfo > div:nth-child(1), .splitinfo > div:nth-child(2) {
			margin-right: 10px;
		}
		.
	  `;
	injectCSS(CSSToInject);

	function extractCustomerInfo() {
		const customerTabDirect = document.querySelector(`[data-slug="section5"]`);
		if (!customerTabDirect) {
			console.log('Customer section not found.');
			return [];
		}
	
		const customerData = [];
		const customerRows = Array.from(customerTabDirect.querySelectorAll('.row:not(.authorized-user-header)'));
	
		for (let i = 0; i < customerRows.length; i += 2) {
			const infoRow = customerRows[i];
			const addressRow = customerRows[i + 1] || null;
	
			// Extract name and the management link (editLink)
			const nameAndLinkElement = infoRow.querySelector('.medium-5.columns a[href*="CustomerManagementLink"]');
			const name = nameAndLinkElement ? nameAndLinkElement.textContent.trim() : 'N/A';
			const editLink = nameAndLinkElement ? nameAndLinkElement.getAttribute('href') : 'N/A';
	
			// Extract the JavaScript function call for modifying the customer
			const editFunctionElement = infoRow.querySelector('.fa-edit');
			const modifyLink = editFunctionElement ? editFunctionElement.getAttribute('onclick') : 'N/A';
	
			// Other information extraction remains the same
			const emailElement = infoRow.querySelector('#customerEmailAddress');
			const phoneElement = infoRow.querySelector('.medium-3.columns').textContent.trim();
			const textMsgLinkElement = infoRow.querySelector('.fa-mobile');
	
			let customer = {
				name: name,
				email: emailElement && emailElement.textContent.includes('@') ? emailElement.textContent.trim() : 'N/A',
				phoneNumber: phoneElement.match(/\(\d{3}\)\s\d{3}-\d{4}/) ? phoneElement.match(/\(\d{3}\)\s\d{3}-\d{4}/)[0] : 'N/A',
				editLink: editLink, // This remains the href link
				modifyLink: modifyLink, // This is the new property for the JavaScript function call
				emailLink: emailElement ? emailElement.nextElementSibling.getAttribute('onclick') : 'N/A',
				textMsgLink: textMsgLinkElement ? textMsgLinkElement.parentElement.getAttribute('onclick') : 'N/A',
				fromAddress: 'N/A', // To be updated below if present
				toAddress: 'N/A' // To be updated below if present
			};
	
			// Extract address information if present
			if (addressRow) {
				const fromAddressElement = addressRow.querySelector('.medium-4.columns b');
				if (fromAddressElement && fromAddressElement.nextSibling) {
					customer.fromAddress = fromAddressElement.nextSibling.textContent.trim() || 'N/A';
				}
	
				const toAddressElement = addressRow.querySelector('.medium-4.columns b:last-of-type');
				if (toAddressElement && toAddressElement.nextSibling) {
					customer.toAddress = toAddressElement.nextSibling.textContent.trim() || 'N/A';
				}
			}
	
			customerData.push(customer);
		}
	
		return customerData;
	}	

	function execute() {
		const CustomerTabDirect = document.querySelector(`[data-slug="section5"]`);
		if (CustomerTabDirect && !CustomerTabDirect.querySelector("#CustomerInformation")) {
			const saveCustomerInformation = extractCustomerInfo();

			// Reset Content
			$(CustomerTabDirect).empty();

			const Html_Content = `
				<div id="CustomerInformation">
					<div id="CustomerInformationTable">
						<a class="right" href="#" onclick="OpenAddCustomer()" style="width: 100%; margin: 3px 0px;"><i class="fa fa-plus"></i> Add Customer</a>
					</div>
				</div>
			`;

			$(CustomerTabDirect).html(Html_Content);

			// Loop through saveCustomerInformation and use the html template to fill in the data
			saveCustomerInformation.forEach(function (customer) {
				const customerHtml = `
					<fieldset class="customerInfo">
						<legend class="customerName">
							${customer.name}
						</legend>
					
						<div class="splitinfo">
							<div>
								Primary:
								<input id="customerPhone" type="text" value="${customer.phoneNumber}" disabled="true">
							</div>
	
							<div>
								Alternative:
								<input id="customerPhoneAlt" type="text" value="N/A" disabled="true">
							</div>
	
							<div>
								Email:
								<input id="customerEmail" type="text" value="${customer.email}" disabled="true">
							</div>
						</div>
	
						<dl class="inline movinginfo">
							<dt>Moving From:</dt>
							<dd id="movingFromAddress">${customer.fromAddress}</dd>
							<dt>Moving To:</dt>
							<dd id="movingToAddress">${customer.toAddress}</dd>
						</dl>
	
						<div class="inputbuttons row">
							<button class="left" type="button" onclick="${customer.textMsgLink}">Send Text</button>
							<button class="left" type="button" onclick="${customer.emailLink}">Send Email</button>
							<button class="left" type="button" onclick="${customer.modifyLink}">Modify Customer</button>
							<a class="left" href="${customer.editLink}" target="_blank"><button type="button">View in uhaul.net</button></a>
						</div>
					</fieldset>
				`;

				// Append the customerHtml to the #CustomerInformationTable
				$('#CustomerInformationTable').append(customerHtml);
			});
		}
	}

	function runSequence() {
		function addScriptVersion(scriptName, version) {
			let scriptVersionElement = document.createElement('div');
			scriptVersionElement.style.display = 'none';
			scriptVersionElement.classList.add('script-version');
			scriptVersionElement.dataset.name = scriptName;
			scriptVersionElement.dataset.version = version;
			document.body.appendChild(scriptVersionElement);
		}

		addScriptVersion("Improved History Screen", "10")

		setInterval(() => {
			execute()
		}, 100); // Check every 100ms
	}

	runSequence();
})();
