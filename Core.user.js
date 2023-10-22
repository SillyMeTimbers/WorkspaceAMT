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
  "HideUncoveredNotDispatch",
  "ReservationSearch",
  "VersionManager",
  "NoteFormatter",
  "betterPaymentInfo",
  "betterHistoryPage",
  "autoUnrentedEquipment",
];

const PermissionsList = {
    "Joshua Mccart": {
        Branch: {
            Live: false,
        },
        Exclude: ["EnhancedMessageTemplates", "ReservationSearch", "betterHistoryPage"],
    },

    "Emily Bertrand": {
        Branch: {
            Live: false,
        },
        Exclude: [],
    },

    "Melissa Wise": {
        Branch: {
            Live: false,
        },
        Exclude: [],
    },

    "Julianna Mayes": {
        Branch: {
            Live: true,
        },
        Exclude: ["ExpNotes_VerifyTime"],
    },

    "Michelle Asker": {
        Branch: {
            Live: true,
        },
        Exclude: [],
    },
    
    "Sheryse McKenzie": {
        Branch: {
            Live: true,
        },
        Exclude: ["ExpNotes_VerifyTime"],
    },
    
    "Nyla Whitty": {
        Branch: {
            Live: true,
        },
        Access: {
            "ExtensionList": true,
            "ExpNotes_VerifyTime": false,
            "TopBarAlert": true,
            "OverdueOpenInPOS": true,
            "SendDropoffButtons": true,
            "EnhancedMessageTemplates": true,
            "HideUncoveredNotDispatch": true,
            "ReservationSearch": true,
            "VersionManager": true,
            "betterPaymentInfo": true,
            "betterHistoryPage": true,
        },
    },
    
    "Wilson Burgos": {
        Branch: {
            Live: true,
        },
        Exclude: ["ExpNotes_VerifyTime"],
    },

    "Amber Ruiz": {
        Branch: {
            Live: true,
        },
        Exclude: ["ExpNotes_VerifyTime"],
    },
  
    "Matthew Glenn": {
        Branch: {
            Live: true,
        },
        Exclude: ["ExpNotes_VerifyTime"],
   },

   "Abigail Heister": {
        Branch: {
            Live: true,
        },
        Exclude: ["ExpNotes_VerifyTime"],
   },

   "Danielle Clifford": {
      Branch: {
          Live: true,
      },
      Exclude: ["ExpNotes_VerifyTime"],
   },
};

(async function() {
  'use strict';
  const UpdateVal = 1;
  const now = new Date();
  const minutes = Math.floor(now.getMinutes() / UpdateVal) * UpdateVal;
  const timeString = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '-' + now.getHours() + ':' + minutes;

  const userName = dynatraceUserName.textContent;

  if (userName in PermissionsList) {
    const userPermissions = PermissionsList[userName];
    const branch = userPermissions.Branch.Live ? 'Live' : 'Experimental';
    const githubURL = `https://raw.githubusercontent.com/SillyMeTimbers/WorkspaceAMT/${branch}/`;

    for (const redirect of Redirects) {
      if (!userPermissions.Exclude.includes(redirect)) { // Only load if not excluded
        const url = `${githubURL}${redirect}.user.js?time=${timeString}`;

        try {
          const response = await fetch(url);

          if (response.ok) {
            const scriptText = await response.text();
            const script = document.createElement('script');
            script.textContent = scriptText;
            document.head.appendChild(script);
          } else {
            console.log(`Failed to fetch script: ${redirect}`);
          }
        } catch (error) {
          console.log(`An error occurred while fetching script: ${redirect}`);
          console.error(error);
        }
      }
    }
  } else {
    console.log(`User "${userName}" is not authorized.`);
  }
})();
