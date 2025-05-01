import { PlayViewUniteReply, PlayViewUniteReq } from '@proto/bilibili/app/playerunite/v1/player';
import { PGCAnyModel } from '@proto/bilibili/app/playerunite/pgcanymodel/pgcanymodel';
import { ClipInfo, ClipType } from '@proto/bilibili/pgc/gateway/player/v2/playurl';
import { BizType, ConfType } from '@proto/bilibili/playershared/playershared';
import { av2bv } from 'src/util/bilibili';

handlePlayViewUniteReq($request);

function handlePlayViewUniteReq({ url, headers, body }) {
    const binaryBody = getBinaryBody(body);
    const message = PlayViewUniteReq.fromBinary(binaryBody);
    const { vod, bvid } = message;
    const { aid, cid } = vod || {};
    Promise.all([
        fetchOriginalRequest(url, headers, body),
        fetchSponsorBlock(bvid || av2bv(aid), cid !== '0' ? cid : ''),
    ])
        .then(([{ headers, body }, segments]) => {
            $done({ response: { headers, body: newRawBody(handlePlayViewUniteReply(body, segments)) } });
        })
        .catch(err => {
            console.log(err.toString());
            $done({});
        });
}

function fetchOriginalRequest(url, headers, body): Promise<{ headers; body }> {
    const params = {
        url,
        headers,
        body,
        'binary-mode': true,
    };
    return new Promise((resolve, reject) => {
        $httpClient.post(params, (error, response, data) => {
            if (response.status !== 200) {
                reject('Fetch Original Request Failed');
            }
            resolve({
                headers: response.headers,
                body: data,
            });
        });
    });
}

function fetchSponsorBlock(bvid, cid): Promise<number[][]> {
    const params = {
        url: `https://bsbsb.top/api/skipSegments?videoID=${bvid}&cid=${cid}&category=sponsor`,
        headers: {
            origin: 'https://github.com/kokoryh/Sparkle/blob/master/release/surge/module/bilibili.sgmodule',
            'x-ext-version': '1.0.0',
        },
    };
    return new Promise(resolve => {
        $httpClient.get(params, (error, response, data) => {
            console.log(response.status);
            if (response.status !== 200) {
                resolve([]);
            } else {
                const body: any[] = JSON.parse(data as string);
                const segments = body.reduce((result, element) => {
                    if (element.actionType === 'skip') {
                        const [start, end] = element.segment;
                        result.push([Math.floor(start), Math.ceil(end)]);
                    }
                    return result;
                }, []);
                resolve(segments);
            }
        });
    });
}

function handlePlayViewUniteReply(body, segments: number[][]) {
    const emptyBytes = new Uint8Array(0);
    const binaryBody = getBinaryBody(body);
    const message = PlayViewUniteReply.fromBinary(binaryBody);
    if (message.viewInfo) {
        message.viewInfo.promptBar = emptyBytes;
    }
    if (!segments.length && message.playArcConf?.arcConfs) {
        Object.values(message.playArcConf.arcConfs).forEach(item => {
            if (item.isSupport && item.disabled) {
                item.disabled = false;
                item.extraContent = undefined;
                item.unsupportScene.length = 0;
            }
        });
    }
    if (segments.length) {
        console.log(JSON.stringify(segments));
        const arcConfs = message.playArcConf?.arcConfs || {};
        [ConfType.SKIPOPED].forEach(i => {
            arcConfs[i] = {
                isSupport: true,
                disabled: false,
                unsupportScene: [],
            };
        });

        if (message.playArc) {
            message.playArc.videoType = BizType.PGC;
        }

        message.supplement = {
            typeUrl: 'type.googleapis.com/bilibili.app.playerunite.pgcanymodel.PGCAnyModel',
            value: PGCAnyModel.toBinary(getPGCAnyModel(segments)),
        };
    }
    return PlayViewUniteReply.toBinary(message);
}

function getPGCAnyModel(segments: number[][]): PGCAnyModel {
    return {
        business: {
            clipInfo: getClipInfo(segments),
            episodeInfo: {
                epId: 1231523,
                cid: '27730904912',
                aid: '113740078909891',
                epStatus: '2',
                seasonInfo: {
                    seasonId: 73081,
                    seasonType: 1,
                    seasonStatus: 13,
                    mode: 2,
                },
            },
            userStatus: {
                watchProgress: {
                    lastEpId: 1212094,
                    lastEpIndex: 'OP',
                    progress: '1',
                    lastPlayAid: '113654498332845',
                    lastPlayCid: '27348831243',
                },
            },
        },
    };
}

function getClipInfo(segments: number[][]): ClipInfo[] {
    return segments.map(segment => ({
        start: segment[0],
        end: segment[1],
        clipType: ClipType.CLIP_TYPE_OP,
    }));
}

function getBinaryBody(body) {
    const header = body.slice(0, 5);
    let binaryBody = body.slice(5);
    if (header[0]) {
        binaryBody = $utils.ungzip(binaryBody);
    }
    return binaryBody;
}

function newRawBody(body) {
    const checksum = Checksum(body.length);
    const rawBody = new Uint8Array(5 + body.length);

    rawBody[0] = 0; // 直接置protobuf 为未压缩状态
    rawBody.set(checksum, 1); // 1-4位： 校验值(4位)
    rawBody.set(body, 5); // 5-end位：protobuf数据
    return rawBody;
}

function Checksum(num) {
    const arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
    const view = new DataView(arr);
    view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
    return new Uint8Array(arr);
}
