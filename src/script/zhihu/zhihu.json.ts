import { parse, stringify } from 'lossless-json';

$done(handleResponse($response) || {});

function handleResponse({ body }) {
    try {
        return { body: stringify(handleQuestions(parse(body))) };
    } catch (e) {
        console.log(e.toString());
        return null;
    }
}

function handleQuestions(body) {
    delete body.ad_info;
    delete body.query_info;
    if (Object.prototype.toString.call(body.data) === '[object Object]') {
        delete body.data.ad_info;
    } else if (Array.isArray(body.data)) {
        body.data = body.data.filter(item => !item?.target?.answer_type?.includes('paid'));
    }
    return body;
}
