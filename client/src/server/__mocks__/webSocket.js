import constants from '../../constants';

export function openWebSocket(_handleMessage) {
    return Promise.resolve();
}

export const sendMessage = jest.fn(message => {
    if (!message)
        throw new Error('not a valid message');
    if (!constants.server.isMessageType(message.type))
        throw new Error(`not a valid message type: ${message.type}`);
    return Promise.resolve();
});