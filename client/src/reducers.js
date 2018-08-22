import messageReducer from './server/messageReducer';
import {combineReducers} from 'redux';
import Constants from './Constants';
import {defaultSettings, getNewSettings, isSettingsResetAction, isSettingsSetAction} from './settings';
import {actionTypes} from './Actions';

function serverReducer(state = {}, action) {
    if (Constants.server.isMessageType(action.type))
        return messageReducer(state, action);
    return state;
}

function settingsReducer(state = defaultSettings, action) {
    if (isSettingsSetAction(action))
        return getNewSettings(state, action.path, action.value);
    if (isSettingsResetAction(action))
        return defaultSettings;
    return state;
}

function uiReducer(state = Constants.initialUi, action) {
    if (action.type === actionTypes.UI_SET_FEATURE_DIAGRAM_LAYOUT)
        return {...state, featureDiagramLayout: action.featureDiagramLayout};
    return state;
}

export default combineReducers({server: serverReducer, settings: settingsReducer, ui: uiReducer});