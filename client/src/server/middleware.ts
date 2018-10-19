import {Dispatch, AnyAction} from 'redux';
import {isOfType} from 'typesafe-actions';
import {SERVER_SEND_MESSAGE} from '../store/actions';
import {sendMessage, sendMultipleMessages} from './webSocket';

export default () => (next: Dispatch<AnyAction>) => (action: any) => {
    if (isOfType(SERVER_SEND_MESSAGE, action)) {
        if (Array.isArray(action.payload))
            sendMultipleMessages(action.payload);
        else
            sendMessage(action.payload);
    }

    return next(action);
};