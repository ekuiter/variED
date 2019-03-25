import {openWebSocket, sendMessage} from './webSocket';
import {Server} from 'mock-socket';
import constants from '../constants';
import {MessageType} from '../types';
import logger from '../helpers/logger';
import {wait} from '../helpers/wait';

jest.mock('../helpers/logger');

const close = (mockServer: any) => {
        mockServer.clients().forEach((webSocket: WebSocket) => webSocket.close());
        mockServer.stop();
        return wait();
    };

describe('webSocket', () => {
    it('opens a web socket', async () => {
        const mockServer = new Server(constants.server.webSocket()),
            connectionMock = jest.fn();
        mockServer.on('connection', connectionMock);
        expect(connectionMock).not.toBeCalled();
        await openWebSocket();
        expect(connectionMock).toBeCalled();
        await close(mockServer);
    });

    it('does not open a web socket if it is already open', async () => {
        const mockServer = new Server(constants.server.webSocket()),
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
        const mockServer = new Server(constants.server.webSocket());
        await openWebSocket();
        await close(mockServer);
    });

    it('reports errors', async () => {
        (logger.warnTagged as any).mockReset();
        const mockServer: any = new Server(constants.server.webSocket());
        expect(logger.warnTagged).not.toBeCalled();
        await openWebSocket();
        mockServer.emit('error');
        expect(logger.warnTagged).toBeCalled();
        await close(mockServer);
    });

    it('receives messages', async () => {
        const mockServer: any = new Server(constants.server.webSocket()),
            handleMessage = jest.fn();
        await openWebSocket(handleMessage);
        mockServer.emit('message', '{"type":"MESSAGE_TEST"}');
        await wait();
        expect(handleMessage).toBeCalledWith({type: 'MESSAGE_TEST'});
        await close(mockServer);
    });

    const sendMessageTest = async (getPromise: () => Promise<void>) => {
        const mockServer: any = new Server(constants.server.webSocket()),
            messageMock = jest.fn();
        mockServer.on('connection', (webSocket: any) => {
            webSocket.on('message', messageMock);
        });
        expect(messageMock).not.toBeCalled();
        await getPromise();
        await sendMessage({type: MessageType.ERROR});
        await wait();
        expect(messageMock).toBeCalledWith(JSON.stringify({type: 'ERROR'}));
        await close(mockServer);
    };

    it('sends messages on an opened web socket', () => sendMessageTest(openWebSocket));
    it('sends messages after opening a new web socket', () => sendMessageTest(() => Promise.resolve()));
});