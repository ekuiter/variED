/**
 * The application uses web sockets to communicate with the server.
 */

import constants from '../constants';
import {Message, MessageType, ArtifactPath} from '../types';
import logger from '../helpers/logger';
import {wait} from '../helpers/wait';
import {State} from '../store/types';

type HandleMessageFunction = (data: Message) => void;

let handleMessage: HandleMessageFunction;

const getWebSocket = ((): () => Promise<WebSocket> => {
    let promise: Promise<WebSocket>;

    function connect(): Promise<WebSocket> {
        return promise = new Promise((resolve, reject) => {
            let webSocket = new WebSocket(constants.server.webSocket);
            
            webSocket.onopen = () => {
                logger.logTagged({tag: 'socket'}, () => 'open');
                resolve(webSocket);
            };
            
            webSocket.onclose = e => {
                logger.warnTagged({tag: 'socket'}, () => `closed with code ${e.code} and reason ${e.reason}`);
                // TODO: notify user that WebSocket was closed (with button to reopen)
            };
            
            webSocket.onerror = e => {
                logger.warnTagged({tag: 'socket'}, () => e);
                // TODO: notify user of error (and IF WebSocket is closed now, a button to reopen it)
                reject(e);
            };
            
            webSocket.onmessage = message => {
                let state: State | undefined = (window as any).app && (window as any).app.store && (window as any).app.store.getState();
                if (!state)
                    logger.warn(() => 'store not accessible, can not simulate message delay');
                wait(state ? state.settings.developer.delay : 0).then(() => {
                    let data = JSON.parse(message.data);
                    logger.logTagged({tag: 'receive'}, () => data);
                    if (handleMessage)
                        handleMessage(data);
                });
            };
        });
    }

    return () => promise
        ? promise.then(webSocket => webSocket.readyState !== webSocket.CLOSED ? webSocket : connect())
        : connect();
})();

export async function openWebSocket(_handleMessage?: HandleMessageFunction): Promise<void> {
    if (typeof _handleMessage === 'function')
        handleMessage = _handleMessage;
    await getWebSocket();
    // return nothing to not expose WebSocket object
}

export async function sendMessage(message: Message, artifactPath?: ArtifactPath, delay = 0): Promise<void> {
    const webSocket = await getWebSocket();
    if (artifactPath)
        message = {artifactPath, ...message};
    logger.logTagged({tag: 'send'}, () => message);
    wait(delay).then(() => webSocket.send(JSON.stringify(message)));
}

export async function sendBatchMessage(messages: Message[], artifactPath?: ArtifactPath, delay = 0): Promise<void> {
    if (!messages || messages.length === 0)
        return;
    if (messages.length === 1)
        await sendMessage(messages[0], artifactPath, delay);
    else
        await sendMessage({type: MessageType.BATCH, messages}, artifactPath, delay);
}