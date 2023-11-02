// ==UserScript==
// @name         [Functional] NewSelectionList
// @namespace    http://tampermonkey.net/
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let showAllLocations = false

    function isSourceVisible() {
        const selectionList = document.querySelector(
            "#EntityDropDown"
        );
        if (
            selectionList &&
            selectionList.offsetWidth > 0 &&
            selectionList.offsetHeight > 0
        ) {
            return true;
        }
        return false;
    }

    function getList() {
        var scriptContent = document.querySelector("#reservationMapDetails > script").innerText;
        var regex = /createPushPin\('((?:[^']|\\')*)',\s*'((?:[^']|\\')*)',\s*'((?:[^']|\\')*)',\s*'((?:[^']|\\')*)',\s*'((?:[^']|\\')*)',\s*'((?:[^']|\\')*)',\s*'((?:[^']|\\')*)',\s*'((?:[^']|\\')*)',\s*'((?:[^']|\\')*)',\s*'((?:[^']|\\')*)',\s*'((?:[^']|\\')*)',\s*'((?:[^']|\\')*)',\s*'((?:[^']|\\')*)',\s*'((?:[^']|\\')*)',\s*'((?:[^']|\\')*)'/g;
        var matches, results = [];

        while ((matches = regex.exec(scriptContent)) !== null) {
            results.push([matches[2], matches[6], matches[9], matches[11], matches[15]]);
        }

        return results;
    }

    function getColor(colorName) {
        const colorMap = {
            'blue': '#007fdf',
            'red': '#ff3333',
            'green': '#00bd55',
            'gray': '#888888',
            'orange': '#ffbc3f',
            'purple': '#9752cb',
            'cyan': '#7030A0',  // Note: This has the same color as 'purple' in your CSS. Adjust if needed.
            'yellow': '#ffff66',
            'black': '#000'
        };

        return colorMap[colorName] || null;  // returns the color code if found, otherwise returns null
    }

    function getCity(cityName) {
        const cityMap = {
            'west palm beach': 'WPB',
            'palm beach gardens': 'PBG',
            'port saint lucie': 'PSL',
        };

        return cityMap[cityName.toLowerCase()] || cityName.toUpperCase();
    }

    function createCheckbox(id, name, text, tooltip, defaultValue) {
        let label = document.createElement('label');
        let input = document.createElement('input');
        let span = document.createElement('span');

        input.setAttribute('data-val', 'true');
        input.setAttribute('data-val-required', 'The DownloadNote field is required.');
        input.setAttribute('id', id);
        input.setAttribute('name', name);
        input.setAttribute('type', 'checkbox');
        label.classList.add("checkbox")
        input.style.marginRight = '5px';
        input.checked = defaultValue;

        if (defaultValue === `true` || defaultValue === true) {
            span.classList.add("checked")
        }

        input.addEventListener('change', function () {
            showAllLocations = input.checked
        });

        input.addEventListener('click', function () {
            span.classList.toggle("checked")
            input.checked = span.classList.contains("checked")
        });

        span.setAttribute('class', 'custom checkbox');
        label.appendChild(input);
        label.appendChild(document.createTextNode(text));
        label.appendChild(span);
        label.setAttribute('id', `${id}_Holder`);
        label.style.width = "fit-content"

        let tooltipContent = $('<span class="tooltip-content" style="width: max-content;"></span>').text(tooltip);
        let tooltipWrapper = $('<div class="tooltip-wrapper"></div>').append(tooltipContent);
        $(label).append(tooltipWrapper);

        $(label).css({
            cursor: 'help',
        });

        $(label).hover(function () {
            console.log("hoverrr")
            $(tooltipContent).css({
                opacity: "1",
                visibility: "visible"
            });
        }, function () {
            $(tooltipContent).css({
                opacity: "0",
                visibility: "hidden"
            });
            console.log("not hoverrr")
        }
        );

        return label;
    }

    function Execute() {
        const locations = getList();

        $("#mapAllEntityLocation > .checkbox").each(function () {
            var holder = $(this);
            if (holder.attr('id') !== "EntityDropDownShowGreen_Holder") {
                holder.remove();
            }
        });

        if ($("#EntityDropDownShowGreen_Holder").length === 0) {
            const IncludeShowGreen = createCheckbox('EntityDropDownShowGreen', 'EntityDropDownPanel.showGreen', 'Show All', 'Shows all locations within selected radius', showAllLocations);

            // Insert after the first child of #mapAllEntityLocation
            $("#mapAllEntityLocation").children().eq(0).before(IncludeShowGreen);
        }

        $("#EntityDropDown option").each(function () {
            const EntitySelection = $(this);
            const entityValue = EntitySelection.val()

            for (let location of locations) {
                if (entityValue === location[0]) {
                    if (showAllLocations == false && location[3] !== "green") {
                        $(EntitySelection).hide()
                    } else {
                        $(EntitySelection).show()
                    }

                    if (EntitySelection.attr(`data-updated`) !== `true`) {
                        let isTruckshareLocation = location[4]

                        if (isTruckshareLocation.length > 1) {
                            isTruckshareLocation = true
                        }

                        if (!location[2] || location[2].length === 0) {
                            location[2] = "0";
                        } else if (location[2][0] === ".") {
                            location[2] = "0" + location[2];
                        }

                        $(EntitySelection).removeClass(location[3]);
                        $(EntitySelection).css("color", getColor(location[3]));
                        $(EntitySelection).css("padding", "2px");

                        EntitySelection.attr('data-updated', 'true');
                        EntitySelection.text(EntitySelection.val() + ` | ${location[2]} : ${getCity(location[1])}` + `${isTruckshareLocation ? ` (24/7)` : ``}`)
                        break;
                    }
                }
            }
        });
    }

    // Function to continuously check if the textSubmitForm is visible
    function InitializeChecks() {
        function addScriptVersion(scriptName, version) {
            let scriptVersionElement = document.createElement('div');
            scriptVersionElement.style.display = 'none';
            scriptVersionElement.classList.add('script-version');
            scriptVersionElement.dataset.name = scriptName;
            scriptVersionElement.dataset.version = version;
            document.body.appendChild(scriptVersionElement);
        }

        addScriptVersion("Better Cover List", "2")

        setInterval(() => {
            if (isSourceVisible()) {
                Execute();
            }
        }, 100);
    }

    InitializeChecks()
})();
