$done(handleRequest($request) || {});

function handleRequest({ url, headers, body }) {
    try {
        if (url.endsWith('/getAdList')) {
            const reqBody = JSON.parse(body);
            return {
                response: {
                    body: getRespBody(reqBody),
                },
            };
        } else if (url.endsWith('/mgw.htm')) {
            const type = headers['operation-type'];
            return { abort: abortRequest(type) };
        }
        return null;
    } catch (e) {
        console.log(e.toString());
        return null;
    }
}

function getRespBody(reqBody) {
    if (reqBody.placementNo === '0007') {
        return '{"materialsList":[{"billMaterialsId":"1","filePath":"#","creativeType":1}],"advertParam":{"skipTime":1}}';
    } else if (reqBody.placementNo === 'G0054') {
        return '{"code":"00","materialsList":[{}]}';
    } else {
        return '{"code":"00","message":"0"}';
    }
}

function abortRequest(type) {
    const filter = new Set(['com.cars.otsmobile.newHomePageBussData']);
    return filter.has(type);
}
