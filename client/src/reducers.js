import messageReducer from './server/messageReducer';
import {combineReducers} from 'redux';
import Constants from './Constants';
import {defaultSettings, getNewSettings, isSettingAction} from './settings';

function serverReducer(state = {}, action) {
    if (Constants.server.isMessageType(action.type))
        return messageReducer(state, action);
    return state;
}

function settingsReducer(state = defaultSettings, action) {
    if (isSettingAction(action))
        return getNewSettings(state, action.path, action.value);
    return state;
}

export default combineReducers({server: serverReducer, settings: settingsReducer});