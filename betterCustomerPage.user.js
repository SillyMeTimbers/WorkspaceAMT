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
			width: calc(50% - 5px)
		}
		.splitinfo > div:nth-child(1) {
			margin-right: 10px;
		}
		.
	  `;
	injectCSS(CSSToInject);

	function execute() {
		const CustomerTabDirect = document.querySelector(`[data-slug="section5"]`);
		if (CustomerTabDirect && !CustomerTabDirect.querySelector("#CustomerInformation")) {
			const CustomerTabInformation = CustomerTabDirect.cloneNode(true)

			CustomerTabDirect.innerHTML = '';  // Reset Content
			const Html_Content = `
				<div id="CustomerInformation">
					<div id="CustomerInformationTable">
						<fieldset class="customerInfo">
							<legend class="customerName">
								John Doe
							</legend>
						
							<div class="splitinfo">
								<div>
									<input id="customerPhone" type="text" value="(999) 999-9999" disabled="true">
								</div>

								<div>
									<input id="customerEmail" type="text" value="johndoe@uhaul.com" disabled="true">
								</div>
							</div>

							<dl class="inline movinginfo">
								<dt>Moving From:</dt>
								<dd id="movingFromAddress">4703 Babcock St, Palm Bay, FL 32905</dd>
								<dt>Moving To:</dt>
								<dd id="movingToAddress">376 N Harbor City Blvd, Melbourne, FL 32935</dd>
                        	</dl>

							<div class="inputbuttons row">
								<button class="left" type="button">Send Text</button>
								<button class="left" type="button">Send Email</button>
								<button class="left" type="button">Modify Customer</button>
								<button class="left" type="button">Manage Customer</button>
							</div>
						</fieldset>

						<p>
							<a class="right" href="#" onclick="OpenAddCustomer()"><i class="fa fa-plus"></i> Add Customer</a>
						</p>
					</div>
				</div>
        	`
			CustomerTabDirect.innerHTML = Html_Content;
			//$("#CustomerInformationTable").append(Template)
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
