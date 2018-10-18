import {Dispatch, AnyAction} from 'redux';
import {isOfType} from 'typesafe-actions';
import {SERVER_SEND_MESSAGE} from '../store/actions';
import {sendMessage} from './webSocket';
import {Message, MessageType} from '../types';

function sendMultipleMessages(messages?: Message[]) {
    if (!messages || messages.length === 0)
        return Promise.resolve();
    if (messages.length === 1)
        return sendMessage(messages[0]);
    return sendMessage({type: MessageType.MULTIPLE_MESSAGES, messages});
}

export default () => (next: Dispatch<AnyAction>) => (action: any) => {
    if (isOfType(SERVER_SEND_MESSAGE, action)) {
        if (Array.isArray(action.payload))
            sendMultipleMessages(action.payload);
        else
            sendMessage(action.payload);
    }

    return next(action);
};