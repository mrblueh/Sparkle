$done(handleRequest($request) || {});

function handleRequest({ url, headers, body }) {
    const routeHandlers = {
        '/getAdList': () => ({
            response: {
                body: getResponseBody(JSON.parse(body)),
            },
        }),
        '/mgw.htm': () => ({
            abort: shouldAbortRequest(headers['operation-type']),
        }),
    };
    try {
        for (const route in routeHandlers) {
            if (url.endsWith(route)) {
                return routeHandlers[route]();
            }
        }
        return null;
    } catch (e) {
        console.log(e.toString());
        return null;
    }
}

function getResponseBody({ placementNo }) {
    if (placementNo === '0007') {
        return '{"materialsList":[{"billMaterialsId":"1","filePath":"#","creativeType":1}],"advertParam":{"skipTime":1}}';
    } else if (placementNo === 'G0054') {
        return '{"code":"00","materialsList":[{}]}';
    } else {
        return '{"code":"00","message":"0"}';
    }
}

function shouldAbortRequest(type) {
    const filter = ['com.cars.otsmobile.newHomePageBussData'];
    return filter.includes(type);
}
