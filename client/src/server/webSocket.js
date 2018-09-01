import constants from '../constants';

let handleMessage;

const getWebSocket = (() => {
    let webSocket;

    function connect() {
        return new Promise((resolve, reject) => {
            webSocket = new WebSocket(constants.server.webSocket);
            
            webSocket.onopen = () => {
                console.log('opened WebSocket');
                resolve(webSocket);
            };
            
            webSocket.onclose = e => {
                console.warn('closed WebSocket with code', e.code, 'and reason', e.reason);
                // TODO: notify user that WebSocket was closed (with button to reopen)
            };
            
            webSocket.onerror = e => {
                console.warn('WebSocket error:', e);
                // TODO: notify user of error (and IF WebSocket is closed now, a button to reopen it)
                reject(e);
            };
            
            webSocket.onmessage = message => {
                let data = JSON.parse(message.data);
                console.log('received:', data);
                handleMessage && handleMessage(data);
            };
        });
    }

    return (mayConnect = true) => !mayConnect || (webSocket && webSocket.readyState !== webSocket.CLOSED)
        ? Promise.resolve(webSocket)
        : connect();
})();

export function openWebSocket(_handleMessage) {
    if (typeof _handleMessage === 'function')
        handleMessage = _handleMessage;
    return getWebSocket().then(() => {}); // do not expose WebSocket object
}

export function sendMessage(message) {
    if (!message)
        throw new Error('not a valid message');
    if (!constants.server.isMessageType(message.type))
        throw new Error(`not a valid message type: ${message.type}`);
    return getWebSocket().then(webSocket => {
        webSocket.send(JSON.stringify(message));
        console.log('sent:', message);
    });
}

window.sendMessage = sendMessage; // for debugging purposes