import Constants from '../Constants';

let handleMessage;

const getWebSocket = (() => {
    let webSocket;

    function connect() {
        return new Promise((resolve, reject) => {
            if (webSocket && webSocket.readyState !== webSocket.CLOSED)
                throw new Error('can not connect while old WebSocket is still in use');
            webSocket = new WebSocket(Constants.websocket);
            webSocket.onopen = () => {
                onOpen();
                resolve(webSocket);
            };
            webSocket.onclose = onClose;
            webSocket.onerror = e => {
                onError(e);
                reject(e);
            };
            webSocket.onmessage = onMessage;
        });
    }

    return () => webSocket && webSocket.readyState !== webSocket.CLOSED
        ? Promise.resolve(webSocket)
        : connect();
})();

function onOpen() {
    console.log('opened WebSocket');
}

function onClose(e) {
    console.warn('closed WebSocket with code', e.code, 'and reason', e.reason);
    // TODO: notify user that WebSocket was closed (with button to reopen)
}

function onError(e) {
    console.warn('WebSocket error:', e);
    // TODO: notify user of error (and IF WebSocket is closed now, a button to reopen it)
}

function onMessage(message) {
    let data = JSON.parse(message.data);
    console.log('received:', data);
    if (handleMessage)
        handleMessage(data);
}

export function openWebSocket(_handleMessage) {
    if (typeof _handleMessage === 'function')
        handleMessage = _handleMessage;
    return getWebSocket().then(() => {}); // do not expose WebSocket object
}

export function sendMessage(message) {
    if (!message)
        throw new Error('not a valid message');
    if (!Constants.server.isMessageType(message.type))
        throw new Error(`not a valid message type: ${message.type}`);
    return getWebSocket().then(webSocket => {
        webSocket.send(JSON.stringify(message));
        console.log('sent:', message);
    });
}

window.sendMessage = sendMessage; // for debugging purposes