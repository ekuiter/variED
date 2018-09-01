import {openWebSocket, sendMessage} from './webSocket';
import {Server} from 'mock-socket';
import constants from '../constants';

const wait = (time = 10) => () => new Promise(resolve => window.setTimeout(resolve, time)),
    close = mockServer => () => {
        mockServer.clients().forEach(webSocket => webSocket.close());
        mockServer.stop();
        return wait()();
    };

describe('webSocket', () => {
    let consoleLog = console.log, consoleWarn = console.warn;
    
    beforeEach(() => {
        console.log = jest.fn();
        console.warn = jest.fn();
    });

    afterEach(() => {
        console.log = consoleLog;
        console.warn = consoleWarn;
    });

    it('opens a web socket', () => {
        const mockServer = new Server(constants.server.webSocket),
            connectionMock = jest.fn();
        mockServer.on('connection', connectionMock);
        expect(console.log).not.toBeCalled();
        expect(connectionMock).not.toBeCalled();
        return openWebSocket()
            .then(() => {
                expect(console.log).toBeCalledWith('opened WebSocket');
                expect(connectionMock).toBeCalled();
            })
            .then(close(mockServer));
    });

    it('does not open a web socket if it is already open', () => {
        const mockServer = new Server(constants.server.webSocket),
            connectionMock = jest.fn();
        mockServer.on('connection', connectionMock);
        expect(connectionMock).toHaveBeenCalledTimes(0);
        return openWebSocket()
            .then(() => {
                expect(connectionMock).toHaveBeenCalledTimes(1);
                openWebSocket();
                expect(connectionMock).toHaveBeenCalledTimes(1);
            })
            .then(close(mockServer));
    });

    it('closes a web socket', () => {
        const mockServer = new Server(constants.server.webSocket);
        expect(console.warn).not.toBeCalled();
        return openWebSocket()
            .then(close(mockServer))
            .then(() => expect(console.warn.mock.calls[0]).toContain('closed WebSocket with code'));
    });

    it('reports errors', () => {
        const mockServer = new Server(constants.server.webSocket);
        expect(console.warn).not.toBeCalled();
        return openWebSocket()
            .then(() => mockServer.emit('error'))
            .then(() => expect(console.warn.mock.calls[0]).toContain('WebSocket error:'))
            .then(close(mockServer));
    });

    it('receives messages', () => {
        const mockServer = new Server(constants.server.webSocket),
            handleMessage = jest.fn();
        return openWebSocket(handleMessage)
            .then(() => mockServer.emit('message', '{"type":"MESSAGE_TEST"}'))
            .then(() => expect(handleMessage).toBeCalledWith({type: 'MESSAGE_TEST'}))
            .then(close(mockServer));
    });

    const sendMessageTest = getPromise => {
        const mockServer = new Server(constants.server.webSocket),
            messageMock = jest.fn();
        mockServer.on('connection', webSocket => {
            webSocket.on('message', messageMock);
        });
        expect(messageMock).not.toBeCalled();
        return getPromise()
            .then(() => sendMessage({type: 'UNDO'}))
            .then(wait())
            .then(() => expect(messageMock).toBeCalledWith(JSON.stringify({type: 'UNDO'})))
            .then(close(mockServer));
    };

    it('sends messages on an opened web socket', () => {
        return sendMessageTest(openWebSocket);
    });

    it('sends messages after opening a new web socket', () => {
        return sendMessageTest(() => Promise.resolve());
    });

    it('errors on invalid parameter', () => {
        expect(() => sendMessage()).toThrow('not a valid message');
        expect(() => sendMessage({type: 'MESSAGE_TEST'})).toThrow('not a valid message type');
    });
});