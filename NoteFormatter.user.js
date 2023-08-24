// ==UserScript==
// @name         [Functional] Notes Formatter
// @namespace    http://tampermonkey.net/
// @version      4.6.1130P
// @description  blahblalba
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==
let NoteTabLastVisible = false;
function isNoteTabVis() {
	const NoteTabDiv = document.querySelector(
		"#reservationContractNotesSummary"
	);
	if (
		NoteTabDiv &&
		NoteTabDiv.offsetWidth > 0 &&
		NoteTabDiv.offsetHeight > 0
	) {
		return true;
	}
	NoteTabLastVisible = false;
	return false;
}

function formatText(inputText) {
	const [keyword, ...restOfInput] = inputText.split(' - ');
	const restOfText = restOfInput.join(' - ');

	const lines = [];
	const inputParts = restOfText.split(', ');

	for (let i = 0; i < inputParts.length; i++) {
		const line = inputParts[i];

		if (line.includes(':')) {
			const [title, value] = line.split(':');
			const trimmedTitle = title.trim();
			const trimmedValue = value.trim();

			if (trimmedTitle === 'Previously Scheduled Date' || trimmedTitle === 'Scheduled Date' || trimmedTitle === 'Preferred Date') {
				lines.push(`${trimmedTitle}: ${[trimmedValue, inputParts[i + 1], inputParts[i + 2]].join(', ')}`);
				i += 2;
			} else if (trimmedTitle === 'Assigned Location') {
				lines.push(`${trimmedTitle}: <a href="https://uhaul.net/contact/crosscontact/Entity/Index/${trimmedValue}" target="_blank">${trimmedValue}</a>`);
			} else {
				lines.push(`${trimmedTitle}: ${trimmedValue}`);
			}
		} else {
			lines.push(line);
		}
	}

	return { keyword, content: lines.join('<br>') };
}

const startWithTable = {
  "Text Sent to Customer - ": (text, hasWorkingNoteClass) => {
    const { keyword, content } = formatText(text);
    if(hasWorkingNoteClass) {
        return `<strong class="working-note">Type: </strong>${keyword}<br>${content}`;
    }
    return `<strong>Type: </strong>${keyword}<br>${content}`;
  },
  "High Demand Confirmation - ": (text, hasWorkingNoteClass) => {
    const { keyword, content } = formatText(text);
    if(hasWorkingNoteClass) {
        return `<strong class="working-note">Type: </strong>${keyword}<br>${content}`;
    }
    return `<strong>Type: </strong>${keyword}<br>${content}`;
  },
};

function resNotesIsVis() {
	const ulElement = document.querySelector('#reservationContractNotesSummary > ul');

	if (ulElement) {
		const listItems = ulElement.querySelectorAll('li');

		listItems.forEach((li) => {
			const pTag = li.querySelector('p');
			let hasWorkingNote = false;

			// Check if li has a div with class 'working-note'
			if (li.querySelector('div.working-note')) {
				hasWorkingNote = true;
			}

			if (pTag) {
				Object.keys(startWithTable).forEach((startWith) => {
					if (pTag.innerText.startsWith(startWith)) {
						const formattingFunction = startWithTable[startWith];
						pTag.innerHTML = formattingFunction(pTag.innerText, hasWorkingNote);
						pTag.classList.add('NoteFormatted');  // add 'updated' class
					}
				});
			}
		});
	}

	// Set height of #reservationContractNotesSummary
	const notesTab = document.querySelector(".notes-content");
	const reservationContractNotesSummary = document.querySelector("#reservationContractNotesSummary");

	if (notesTab && reservationContractNotesSummary) {
		const actualHeight = reservationContractNotesSummary.clientHeight;
		notesTab.style.minHeight = `${Math.min(actualHeight, 200)}px`;
	}
}


// Function to continuously check
function resCheckIfNotesTabVis() {
	function addScriptVersion(scriptName, version) {
		let scriptVersionElement = document.createElement('div');
		scriptVersionElement.style.display = 'none'; // Make it hidden
		scriptVersionElement.classList.add('script-version'); // So we can find it later
		scriptVersionElement.dataset.name = scriptName; // Store the script name
		scriptVersionElement.dataset.version = version; // Store the version
		document.body.appendChild(scriptVersionElement);
	}

	addScriptVersion("Reservation Notes", "3")

	setInterval(() => {
		if (isNoteTabVis()) {
			resNotesIsVis();
			NoteTabLastVisible = true;
		}
	}, 100); // Check every 100ms
}

// Start checking the Reservation Popup visibility
resCheckIfNotesTabVis();
