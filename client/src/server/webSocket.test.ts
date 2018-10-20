import {openWebSocket, sendMessage} from './webSocket';
import {Server} from 'mock-socket';
import constants from '../constants';
import {MessageType} from '../types';

const wait = (time = 10) => new Promise(resolve => window.setTimeout(resolve, time)),
    close = (mockServer: any) => {
        mockServer.clients().forEach((webSocket: WebSocket) => webSocket.close());
        mockServer.stop();
        return wait();
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

    it('opens a web socket', async () => {
        const mockServer = new Server(constants.server.webSocket),
            connectionMock = jest.fn();
        mockServer.on('connection', connectionMock);
        expect(console.log).not.toBeCalled();
        expect(connectionMock).not.toBeCalled();
        await openWebSocket();
        expect(console.log).toBeCalledWith('opened WebSocket');
        expect(connectionMock).toBeCalled();
        await close(mockServer);
    });

    it('does not open a web socket if it is already open', async () => {
        const mockServer = new Server(constants.server.webSocket),
            connectionMock = jest.fn();
        mockServer.on('connection', connectionMock);
        expect(connectionMock).toHaveBeenCalledTimes(0);
        await openWebSocket();
        expect(connectionMock).toHaveBeenCalledTimes(1);
        openWebSocket();
        expect(connectionMock).toHaveBeenCalledTimes(1);
        await close(mockServer);
    });

    it('closes a web socket', async () => {
        const mockServer = new Server(constants.server.webSocket);
        expect(console.warn).not.toBeCalled();
        await openWebSocket();
        await close(mockServer);
        expect((console.warn as jest.Mock).mock.calls[0]).toContain('closed WebSocket with code');
    });

    it('reports errors', async () => {
        const mockServer: any = new Server(constants.server.webSocket);
        expect(console.warn).not.toBeCalled();
        await openWebSocket();
        mockServer.emit('error');
        expect((console.warn as jest.Mock).mock.calls[0]).toContain('WebSocket error:');
        await close(mockServer);
    });

    it('receives messages', async () => {
        const mockServer: any = new Server(constants.server.webSocket),
            handleMessage = jest.fn();
        await openWebSocket(handleMessage);
        mockServer.emit('message', '{"type":"MESSAGE_TEST"}');
        expect(handleMessage).toBeCalledWith({type: 'MESSAGE_TEST'});
        await close(mockServer);
    });

    const sendMessageTest = async (getPromise: () => Promise<void>) => {
        const mockServer: any = new Server(constants.server.webSocket),
            messageMock = jest.fn();
        mockServer.on('connection', (webSocket: any) => {
            webSocket.on('message', messageMock);
        });
        expect(messageMock).not.toBeCalled();
        await getPromise();
        await sendMessage({type: MessageType.UNDO});
        await wait();
        expect(messageMock).toBeCalledWith(JSON.stringify({type: 'UNDO'}));
        await close(mockServer);
    };

    it('sends messages on an opened web socket', () => sendMessageTest(openWebSocket));
    it('sends messages after opening a new web socket', () => sendMessageTest(() => Promise.resolve()));
});