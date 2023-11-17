// ==UserScript==
// @name         [Functional] betterNotDispatch
// @namespace    http://tampermonkey.net/
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const NotDispatchCleaner = "11"
    let NotDispatchReportLastVisible = false;
    let NotDispatchSettings = {
        "UBOX": true,
        "Uncovered": false,
    }

    function NotDispatchinjectCSS(css) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    const LatePickup = `
        tr.even-row, tr.odd-row {
            -moz-transition: background-color 300ms ease-out;
            -o-transition: background-color 300ms ease-out;
            -webkit-transition: background-color 300ms ease-out;
            transition: background-color 300ms ease-out;
        }
        tr.even-row{
            background: white !important;
        }
        tr.odd-row{
            background: #f1f1f1 !important;
        }
        tr.latePU.odd-row{
            background: #cb3d36 !important;
        }
        tr.latePU.even-row{
            background: #bd362f !important;
        }
        tr.latePU td {
            color: #fff !important;
        }
        tr.latePU:hover {
            background: #e35a52 !important;
        }
        tr.notLatePU:hover {
            background: #d4e2f0 !important;
        }
`;
    NotDispatchinjectCSS(LatePickup);

    function isNotDispatchReportActive() {
        const NotDispatchReportDiv = document.querySelector(
            "#NotDispatchedResults_wrapper"
        );
        if (
            NotDispatchReportDiv &&
            NotDispatchReportDiv.offsetWidth > 0 &&
            NotDispatchReportDiv.offsetHeight > 0
        ) {
            return true;
        }
        NotDispatchReportLastVisible = false;
        return false;
    }

    function notDispatchUpdateCheckbox(checkbox) {
        if (checkbox.id === "addUBOX") {
            NotDispatchSettings.UBOX = $(checkbox).prop('checked')
        }

        if (checkbox.id === "addUncovered") {
            NotDispatchSettings.Uncovered = $(checkbox).prop('checked')
        }
    }

    function createCheckbox(id, name, text, defaultValue) {
        let label = document.createElement('label');
        let input = document.createElement('input');
        input.setAttribute('data-val', 'true');
        input.setAttribute('data-val-required', 'The DownloadNote field is required.');
        input.setAttribute('id', id);
        input.setAttribute('name', name);
        input.setAttribute('type', 'checkbox');
        input.style.marginRight = '5px';
        input.checked = defaultValue;

        input.addEventListener('change', function () {
            notDispatchUpdateCheckbox(this);
        });

        let span = document.createElement('span');
        span.setAttribute('class', 'custom checkbox');
        label.appendChild(input);
        label.appendChild(document.createTextNode(text));
        label.appendChild(span);
        label.setAttribute('id', `${id}_Holder`);
        label.style.width = "fit-content"

        return label;
    }

    function GetModalData(url, data, method="GET") {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: method,
                async: true,
                url: url,
                data: data,
                cache: false,
                success: function(response) {
                    if (IsValidValue(response.error)) {
                        toastr.error(response.error, "An error has occured:");
                        reject(response.error);
                    } else if (IsValidValue(response)) {
                        resolve(response);
                    } else {
                        toastr.error("Could not load.");
                        reject("Could not load.");
                    }
                },
                error: function(xhr) {
                    toastr.error("An error has occurred");
                    reject(xhr.responseText);
                }
            });
        });
    }

    function getLatestWorkingNote(Data) {
        const Notes = $(Data).find(".notes");
        let saveNote = null

        Notes.find("> li").each(function (index, element) {
            const isWorkingNote = $(element).find(".working-note");
            
            if (isWorkingNote.length > 0 && saveNote == null) {
                saveNote = $(element).find("> p").text().trim();
            }
        });

        return saveNote
    }

    function Execute() {
        if (document.querySelector("#addUBOX_Holder") == null) {
            const IncludeUBOX = createCheckbox('addUBOX', 'NotDispatchPanel.addUBox', 'Include U-Box', NotDispatchSettings.UBOX);
            document.querySelector("#NotDispatchedResults_wrapper > div.DTTT_container").appendChild(IncludeUBOX);

            const IncludeUncovered = createCheckbox('addUncovered', 'NotDispatchPanel.addUncovered', 'Include 781008', NotDispatchSettings.Uncovered);
            document.querySelector("#NotDispatchedResults_wrapper > div.DTTT_container").appendChild(IncludeUncovered);

            // const tbody = document.querySelector("#NotDispatchedResults_wrapper .fixed-table > thead > tr");
            // if (tbody) {
            //     console.log('add')
            //     $(tbody).find("> th:nth-child(10)").remove()
            //     const AddWorkingNoteColumn = $(`<th class="sorting" tabindex="0" aria-controls="NotDispatchedResults" rowspan="1" colspan="1" aria-label="
            //     Working Note
            // : activate to sort column ascending" style="width: 139.531px;">
            //     <span>Working Note</span>
            // </th>`)
            //     $(tbody).append(AddWorkingNoteColumn);
            // }
        }

        const tbody = document.querySelector("#NotDispatchedResults > tbody");
        function getOrdinalSuffix(number) {
            if (number % 10 == 1 && number != 11) {
                return 'st';
            }
            if (number % 10 == 2 && number != 12) {
                return 'nd';
            }
            if (number % 10 == 3 && number != 13) {
                return 'rd';
            }
            return 'th';
        }

        $(tbody).find("> tr").each(function (index, element) {
            const locID = $(this).find("> td:nth-child(8)").text().trim()
            const equipID = $(this).find("> td:nth-child(7)").text().trim()

            const ignoreLocations = ['781008'];
            const ignoreEquipment = ['AA', 'AB'];

            let shouldHide = false;
            if (NotDispatchSettings.Uncovered == false && ignoreLocations.some(location => locID.endsWith(location))) {
                shouldHide = true;
            } else if ((NotDispatchSettings.UBOX == false && ignoreEquipment.some(equipment => equipID.includes(equipment)))) {
                shouldHide = true;
            }

            if (shouldHide) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });

        $(tbody).find("> tr:visible").each(function (index, element) {
            const locID = $(this).find("> td:nth-child(8)").text().trim()
            const equipID = $(this).find("> td:nth-child(7)").text().trim()
            const rawDate = $(this).find("> td:nth-child(6)").text().trim()

            if (index % 2 === 0) {
                $(this).addClass('even-row').removeClass('odd-row');
            } else {
                $(this).addClass('odd-row').removeClass('even-row');
            }

            if (rawDate && !$(this).data("processed")) {
                const pickupTime = new Date(rawDate);
                if (isNaN(pickupTime)) return;

                const currentTime = new Date();
                const differenceInMilliseconds = currentTime - pickupTime;
                const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
                const differenceInHours = Math.floor(differenceInMinutes / 60);
                const differenceInDays = Math.floor(differenceInHours / 24);

                let elapsedTime = "";
                if (differenceInDays > 0) {
                    elapsedTime += `${differenceInDays}d `;
                    elapsedTime += `${differenceInHours % 24}hr `;
                } else if (differenceInHours > 0) {
                    elapsedTime += `${differenceInHours}hr `;
                }
                elapsedTime += `${differenceInMinutes % 60}min`;

                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const day = pickupTime.getDate();
                const month = monthNames[pickupTime.getMonth()];
                const year = pickupTime.getFullYear();
                const hours = pickupTime.getHours();
                const minutes = String(pickupTime.getMinutes()).padStart(2, '0');
                const amPm = hours < 12 ? "AM" : "PM";
                const formattedHour = hours > 12 ? hours - 12 : hours;
                const formattedDate = `${month} ${day}${getOrdinalSuffix(day)}, ${year} ${formattedHour}:${minutes} ${amPm} | ${elapsedTime}`;
                $(this).find("td:nth-child(6)").text(formattedDate)

                if (differenceInMinutes > 60) {
                    $(this).removeClass("notLatePU")
                    $(this).addClass("latePU")
                } else {
                    $(this).addClass("notLatePU")
                    $(this).removeClass("latePU")
                }

                // // Add Working Notes
                // const NoteText = ""
                // const NoteBox = $(`<td></td>`)
                // $(this).find("> td:nth-child(10)").remove()
                // $(this).append(NoteBox);

                // var data = {
                //     contractID: $(this).data("contractid")
                // };

                // GetModalData(UrlAction("DisplayContractNotesFromDashboard", "Reservations"), data)
                //     .then(function(htmlData) {
                //         const passedNote = getLatestWorkingNote(htmlData);
                //         NoteBox.attr('title', passedNote);
                //         NoteBox.text(passedNote);
                //         NoteBox.addClass("note has-tip");
                //         NoteBox.attr('data-tooltip', '');     
                //         NoteBox.css(`white-space`, `nowrap`)

                //         console.log(htmlData);
                //     })
                //     .catch(function(error) {
                //         console.error(error);
                //     });

                // var table = $('#NotDispatchedResults').DataTable();
                // table.columns.adjust().draw();
                $(this).data("processed", "true");
            }
        });
    }

    function isNotDispatchReport() {
        function addScriptVersion(scriptName, version) {
            let scriptVersionElement = document.createElement('div');
            scriptVersionElement.style.display = 'none';
            scriptVersionElement.classList.add('script-version');
            scriptVersionElement.dataset.name = scriptName;
            scriptVersionElement.dataset.version = version;
            document.body.appendChild(scriptVersionElement);
        }

        addScriptVersion("Better Not-Dispatch", NotDispatchCleaner)

        setInterval(() => {
            if (isNotDispatchReportActive()) {
                Execute();
                NotDispatchReportLastVisible = true;
            }
        }, 100);
    }

    isNotDispatchReport();
})();
