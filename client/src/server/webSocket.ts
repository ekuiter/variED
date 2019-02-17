/**
 * The application uses web sockets to communicate with the server.
 */

import constants from '../constants';
import {Message} from '../types';
import logger from '../helpers/logger';
import {wait} from '../helpers/wait';
import {State} from '../store/types';
import Sockette from 'sockette';

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

const getWebSocket = ((): () => Promise<Sockette> => {
    let promise: Promise<Sockette> | undefined;

    function connect(): Promise<Sockette> {
        return promise = new Promise((resolve, reject) => {
            const sockette = new Sockette(constants.server.webSocket, {
                onopen() {
                    logger.logTagged({tag}, () => 'open');
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
                    logger.logTagged({tag}, () => 'reconnect');
                    // TODO: notify user of reconnect
                    // Re-opening a WebSocket is involved because the existing Redux state has to be considered.
                    // For example, we should log in as the same user participating in the same collaboration sessions,
                    // as if she never left. (For optimistic UI, pending operations have to be submitted as well.)
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