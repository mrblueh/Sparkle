import * as cheerio from 'cheerio';
// import * as fs from 'fs';
// const $response = {
//     headers: {
//         'content-type': 'text/html',
//     },
//     body: fs.readFileSync('./input.html', 'utf-8'),
// };
// const $done = ({ body }) => {
//     fs.writeFileSync('./output.html', body);
// };

const headers = $response.headers;
const contentType = headers['content-type'];
if (!contentType?.includes('text/html')) $done({});

const scriptElement = `
<script>
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
        });
    })();
</script>
`;
const styleElement = `
<style>
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
</style>
`;
const scriptElementFilter = (i, element) => {
    if (element.attribs?.src?.includes('cdn.tsyndicate.com')) {
        return true;
    }
    if (element.children?.[0]?.data?.includes('TSOutstreamVideo')) {
        return true;
    }
    if (element.children?.[0]?.data?.includes('htmlAds')) {
        return true;
    }
    return false;
};
const handleResponse = ({ body }) => {
    try {
        const $ = cheerio.load(body);
        $('script').filter(scriptElementFilter).remove();
        $('head').append(scriptElement, styleElement);
        return { body: $.html() };
    } catch (e) {
        console.log(e.toString());
        return null;
    }
};

$done(handleResponse($response) || {});
