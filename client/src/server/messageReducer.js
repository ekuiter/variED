/**
 * Incoming server messages are reduced into the Redux store.
 * This way we use the same mechanism to process actions from the client and server.
 */

import {setAdd, setRemove} from '../helpers/reducers';
import {MessageType} from '../types';

const messageReducers = {
    [MessageType.ERROR](state, action) {
        console.warn(action.error);
        return state;
    },
    [MessageType.JOIN](state, action) {
        return {...state, users: setAdd(state.users, action.user)};
    },
    [MessageType.LEAVE](state, action) {
        return {...state, users: setRemove(state.users, action.user)};
    },
    [MessageType.FEATURE_DIAGRAM_FEATURE_MODEL](state, action) {
        return {...state, featureModel: action.featureModel};
    },
    [MessageType.FEATURE_DIAGRAM_FEATURE_RENAME](state, _action) {
        // Feature renaming is handled by the serverUiReducer
        // because it has access to the UI state.
        return state;
    }
};

export default (state, action) => {
    if (Object.keys(messageReducers).includes(action.type))
        return messageReducers[action.type](state, action);
    else {
        console.warn(`no message reducer defined for action type ${action.type}`);
        return state;
    }
};