try {
    const url = $request.url;
    if (url.endsWith('/getAdList')) {
        const reqBody = JSON.parse($request.body);
        $done({
            response: {
                body: getRespBody(reqBody),
            },
        });
    } else if (url.endsWith('/mgw.htm')) {
        const headers = $request.headers;
        const type = headers['operation-type'];
        $done({ abort: abortRequest(type) });
    }
} catch (e) {
    console.log(e.toString());
} finally {
    $done({});
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
    const filter = ['com.cars.otsmobile.newHomePageBussData'];
    return filter.includes(type);
}
