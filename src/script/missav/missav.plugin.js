// ==UserScript==
// @name         Missav
// @namespace    http://tampermonkey.net/
// @version      2025-03-14
// @description  try to take over the world!
// @author       kokoryh
// @match        https://missav.ai/*
// @match        https://missav.ws/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=missav.ai
// @grant        none
// ==/UserScript==

const style = `
    .lg\\:block,
    .lg\\:hidden,
    a[href*="//bit.ly/"],
    div:has(a[href*='go.myavlive.com']),
    [x-show$="video_details'"] > div > ul,
    div[style*='width: 300px; height: 250px;'],
    .relative > div[x-init*='campaignId=under_player'],
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
