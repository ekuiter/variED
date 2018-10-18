/**
 * Incoming server messages are reduced into the Redux store.
 * This way we use the same mechanism to process actions from the client and server.
 */

import {setAdd, setRemove} from '../helpers/reducer';
import {MessageType} from '../types';
import {ServerReceiveAction} from './actions';
import { getFromState, getNewState } from '../store/settings';

const reducerMap = {
    [MessageType.ERROR](state: object, action: ServerReceiveAction) {
        console.warn(action.payload.error);
        return state;
    },
    [MessageType.USER_JOINED](state: object, action: ServerReceiveAction) {
        return getNewState(state, 'server.users', setAdd(getFromState(state, 'server.users'), action.payload.user));
    },
    [MessageType.USER_LEFT](state: object, action: ServerReceiveAction) {
        return getNewState(state, 'server.users', setRemove(getFromState(state, 'server.users'), action.payload.user));
    },
    [MessageType.FEATURE_DIAGRAM_FEATURE_MODEL](state: object, action: ServerReceiveAction) {
        return getNewState(state, 'server.featureModel', action.payload.featureModel);
    },
    [MessageType.FEATURE_DIAGRAM_FEATURE_RENAME](state: object, _action: ServerReceiveAction) {
        // Feature renaming is handled by the finalReducer
        // because it has access to the UI state.
        // TODO: maybe move code from main reducer here.
        return state;
    }
};

export default (state: object /*TODO*/, action: ServerReceiveAction) => {
    if (Object.keys(reducerMap).includes(action.payload.type))
        return reducerMap[action.payload.type](state, action);
    else {
        console.warn(`no message reducer defined for action type ${action.payload.type}`);
        return state;
    }
};
