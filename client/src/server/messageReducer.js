import constants from '../constants';
import {uniqueArrayAdd, uniqueArrayRemove} from '../helpers/reducers';

const messageTypes = constants.server.messageTypes,
    messageReducers = {
        [messageTypes.ERROR](state, action) {
            console.warn(action.error);
            return state;
        },
        [messageTypes.USER_SUBSCRIBE](state, action) {
            return {...state, users: uniqueArrayAdd(state.users, action.user)};
        },
        [messageTypes.USER_UNSUBSCRIBE](state, action) {
            return {...state, users: uniqueArrayRemove(state.users, action.user)};
        },
        [messageTypes.FEATURE_MODEL](state, action) {
            return {...state, featureModel: action.featureModel};
        },
        [messageTypes.FEATURE_RENAME](state, _action) {
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