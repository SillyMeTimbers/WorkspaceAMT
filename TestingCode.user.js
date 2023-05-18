// ==UserScript==
// @name         [Ultra-Testing] 
// @namespace    http://tampermonkey.net/
// @version      no
// @description  Shows full list of company extensions
// @author       You
// @match        https://amt.uhaul.net/*/Dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uhaul.net
// @grant        GM_xmlhttpRequest
// ==/UserScript==

const Redirects = [
  "ExtensionList",
  "ExpNotes_VerifyTime",
  "TopBarAlert",
  "OverdueOpenInPOS",
  "SendDropoffButtons",
  "EnhancedMessageTemplates",
];

(function() {
  'use strict';
  const UpdateVal = 1;
  const now = new Date();
  const minutes = Math.floor(now.getMinutes() / UpdateVal) * UpdateVal;
  const timeString = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '-' + now.getHours() + ':' + minutes;

  Redirects.forEach(redirect => {
    const url = `https://raw.githubusercontent.com/SillyMeTimbers/WorkspaceAMT/main/${redirect}.user.js?time=${timeString}`;

    GM_xmlhttpRequest({
      method: "GET",
      url: url,
      onload: function(response) {
        const script = document.createElement('script');
        script.textContent = response.responseText;
        document.head.appendChild(script);
      }
    });
  });
})();
