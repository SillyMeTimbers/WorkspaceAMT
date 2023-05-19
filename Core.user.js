// ==UserScript==
// @name         [Ultra-Testing]
// @namespace    http://tampermonkey.net/
// @version      no
// @description  Shows full list of company extensions
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        none
// ==/UserScript==

const Redirects = [
  "ExtensionList",
  "ExpNotes_VerifyTime",
  "TopBarAlert",
  "OverdueOpenInPOS",
  "SendDropoffButtons",
  "EnhancedMessageTemplates",
];

(async function() {
  'use strict';
  const UpdateVal = 1;
  const now = new Date();
  const minutes = Math.floor(now.getMinutes() / UpdateVal) * UpdateVal;
  const timeString = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '-' + now.getHours() + ':' + minutes;

  for (const redirect of Redirects) {
    const url = `https://raw.githubusercontent.com/SillyMeTimbers/WorkspaceAMT/Experimental/${redirect}.user.js?time=${timeString}`;
    const response = await fetch(url);
    const scriptText = await response.text();

    const script = document.createElement('script');
    script.textContent = scriptText;
    document.head.appendChild(script);
  }
})();
