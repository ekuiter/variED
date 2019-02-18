/**
 * The application uses web sockets to communicate with the server.
 */

import constants from '../constants';
import {Message} from '../types';
import logger from '../helpers/logger';
import {wait} from '../helpers/wait';
import {State} from '../store/types';
import Sockette from './Sockette';

type HandleMessageFunction = (data: Message) => void;

let handleMessage: HandleMessageFunction;
const tag = 'socket';

function getSimulateDelay() {
    const state: State | undefined =
        (window as any).app && (window as any).app.store && (window as any).app.store.getState();
    if (!state)
        logger.warn(() => 'store not accessible, can not simulate message delay');
    return state ? state.settings.developer.simulateDelay : 0;
}

function getSiteID() {
    const state: State | undefined =
        (window as any).app && (window as any).app.store && (window as any).app.store.getState();
    if (!state)
        logger.warn(() => 'store not accessible, can not obtain site ID');
    return state && state.myself ? state.myself.siteID : 'initialize';
}

export function isSimulateOffline() {
    const state: State | undefined =
        (window as any).app && (window as any).app.store && (window as any).app.store.getState();
    if (!state)
        logger.warn(() => 'store not accessible, can not simulate offline site');
    return state ? state.settings.developer.simulateOffline : 0;
}

const getWebSocket = ((): () => Promise<Sockette> => {
    let promise: Promise<Sockette> | undefined;

    function connect(): Promise<Sockette> {
        return promise = new Promise((resolve, reject) => {
            const url = constants.server.webSocket(getSiteID());
            logger.logTagged({tag}, () => `connecting to ${url}`);

            if (isSimulateOffline()) {
                reject('simulating offline, abort connect');
                return;
            }

            const sockette = new Sockette(url, {
                onopen() {
                    logger.logTagged({tag}, () => `open`);
                    resolve(sockette);
                },

                onclose(e) {
                    logger.warnTagged({tag}, () => `closed with code ${e.code} and reason ${e.reason}`);
                    promise = undefined;
                    // TODO: notify user that WebSocket was closed
                },

                onerror(e) {
                    logger.warnTagged({tag}, () => e);
                    // TODO: notify user of error
                    reject(e);
                },

                onreconnect() {
                    // TODO: notify user of reconnect
                    const url = constants.server.webSocket(getSiteID());
                    logger.logTagged({tag}, () => `reconnect to ${url}`);
                    return url;
                },

                onmessage(message) {
                    wait(getSimulateDelay()).then(() => {
                        const data = JSON.parse(message.data);
                        logger.logTagged({tag: 'receive'}, () => data);
                        if (handleMessage)
                            handleMessage(data);
                    });
                }
            });
        });
    }

    return () => promise || connect();
})();

export async function openWebSocket(_handleMessage?: HandleMessageFunction): Promise<void> {
    if (typeof _handleMessage === 'function')
        handleMessage = _handleMessage;
    await getWebSocket();
    // return nothing to not expose WebSocket object
}

export async function sendMessage(message: Message): Promise<void> {
    const webSocket = await getWebSocket();
    logger.logTagged({tag: 'send'}, () => message);
    await wait(getSimulateDelay());
    webSocket.send(JSON.stringify(message));
}