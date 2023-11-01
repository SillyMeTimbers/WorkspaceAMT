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
    
        // Updated regex pattern to capture the desired arguments
        var regex = /createPushPin\('[^']+',\s*'([^']+)',\s*'[^']+',\s*'[^']+',\s*'[^']+',\s*'([^']+)',\s*'[^']+',\s*'[^']+',\s*'([^']+)',\s*'[^']+',\s*'([^']+)',/g;
        var matches, results = [];
    
        while ((matches = regex.exec(scriptContent)) !== null) {
            results.push([matches[1], matches[2], matches[3], matches[4]]);
        }
    
        return results;
    }    

    function Execute() {
        const locations = getList();
        
        $("#EntityDropDown option").each(function() {
            const EntitySelection = $(this);
            const entityValue = EntitySelection.val()
    
            if (EntitySelection.attr(`data-updated`) !== `true`) {
                for (let location of locations) {
                    if (entityValue === location[0]) {
                        console.log('This option matches a location from the list');
                        EntitySelection.attr('data-updated', 'true');
                        EntitySelection.text(EntitySelection.val() + ` | ${location[2]} : ${location[1]}`)
                        console.log(location)
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

        addScriptVersion("Better Selection List", "1")

        setInterval(() => {
            if (isSourceVisible()) {
                Execute();
            }
        }, 100);
    }

    InitializeChecks()
})();
