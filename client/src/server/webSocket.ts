/**
 * The application uses web sockets to communicate with the server.
 */

import constants from '../constants';
import {Message, MessageType, ArtifactPath} from '../types';
import logger from '../helpers/logger';

type HandleMessageFunction = (data: Message) => void;

let handleMessage: HandleMessageFunction;

const getWebSocket = ((): () => Promise<WebSocket> => {
    let webSocket: WebSocket;

    function connect(): Promise<WebSocket> {
        return new Promise((resolve, reject) => {
            webSocket = new WebSocket(constants.server.webSocket);
            
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
                let data = JSON.parse(message.data);
                logger.logTagged({tag: 'receive'}, () => data);
                handleMessage && handleMessage(data);
            };
        });
    }

    return () => (webSocket && webSocket.readyState !== webSocket.CLOSED)
        ? Promise.resolve(webSocket)
        : connect();
})();

export async function openWebSocket(_handleMessage?: HandleMessageFunction): Promise<void> {
    if (typeof _handleMessage === 'function')
        handleMessage = _handleMessage;
    await getWebSocket();
    // return nothing to not expose WebSocket object
}

export async function sendMessage(message: Message, artifactPath?: ArtifactPath): Promise<void> {
    const webSocket = await getWebSocket();
    if (artifactPath)
        message = {artifactPath, ...message};
    webSocket.send(JSON.stringify(message));
    logger.logTagged({tag: 'send'}, () => message);
}

export async function sendBatchMessage(messages: Message[], artifactPath?: ArtifactPath): Promise<void> {
    if (!messages || messages.length === 0)
        return;
    if (messages.length === 1)
        await sendMessage(messages[0], artifactPath);
    else
        await sendMessage({type: MessageType.BATCH, messages}, artifactPath);
}