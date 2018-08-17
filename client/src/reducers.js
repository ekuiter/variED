import Constants from './Constants';
import messageReducer from './server/messageReducer';
import {combineReducers} from 'redux';

const initialUiState = {
    layout: 'horizontalTree',
    useTransitions: true
};

function serverReducer(state = {}, action) {
    if (Constants.server.isMessageType(action.type))
        return messageReducer(state, action);
    return state;
}

function uiReducer(state = initialUiState, action) {
    if (action.type === 'UI_LAYOUT')
        return {...state, layout: action.layout};
    if (action.type === 'UI_TOGGLE_USE_TRANSITIONS')
        return {...state, useTransitions: !state.useTransitions};
    return state;
}

export default combineReducers({server: serverReducer, ui: uiReducer});