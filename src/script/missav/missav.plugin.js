// ==UserScript==
// @name         Missav
// @namespace    http://tampermonkey.net/
// @version      2025-02-23
// @description  try to take over the world!
// @author       kokoryh
// @match        https://missav.ws/*
// @match        https://missav.ai/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=missav.ai
// @grant        none
// ==/UserScript==

const style = `
    .lg\\:hidden {
        display: none !important;
    }
    .lg\\:block {
        display: none !important;
    }
    a[href*="//bit.ly/"]
    {
        display: none !important;
    }
    .relative > div[x-init*='campaignId=under_player'] {
        display: none !important;
    }
    div[style*='width: 300px; height: 250px;'] {
        display: none !important;
    }
    div:has(a[href*='go.myavlive.com']) {
        display: none !important;
    }
    div[x-show^='recommendItems'] ~ div[class]:has(> div > div.mx-auto > div.flex > a[rel^='sponsored']) {
        display: none !important;
    }
`;

(function () {
    'use strict';
    document.addEventListener('ready', () => {
        window.open = () => {};
        if (window.player?.pause) {
            const pause = window.player.pause;
            window.player.pause = () => {
                if (document.hasFocus()) {
                    pause();
                }
            };
        }

        const styleElement = document.createElement('style');
        styleElement.innerHTML = style;
        document.querySelector('head').appendChild(styleElement);
    });
})();
