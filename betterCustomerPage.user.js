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
	  `;
	injectCSS(CSSToInject);

	function execute() {
		const CustomerTabDirect = document.querySelector(`[data-slug="section5"]`);
		if (CustomerTabDirect && !CustomerTabDirect.querySelector("#CustomerInformation")) {
			const CustomerTabInformation = CustomerTabDirect.cloneNode(true)
			// const Template = $(`

			// `)
			// Template.show()

			CustomerTabDirect.innerHTML = '';  // Reset Content
			const Html_Content = `
				<div id="CustomerInformation">
					<table id="CustomerInformationTable">
						<tbody>
							<tr>
								<td>
									Customer
									<input id="CustomerNameIdentifier" type="text" value="" disabled="true">
								</td>
							</tr>
						</tbody>
					</table>
				</div>		  
        	`

			$(`[data-slug="section5"]`).css("padding", "0px")
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
