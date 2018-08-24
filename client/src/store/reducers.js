import messageReducer from '../server/messageReducer';
import reduceReducers from 'reduce-reducers';
import constants from '../constants';
import {defaultSettings, getNewSettings, isSettingsResetAction, isSettingsSetAction} from './settings';
import {actionTypes} from './actions';
import FeatureModel from '../server/FeatureModel';

function serverReducer(state, action) {
    if (constants.server.isMessageType(action.type))
        return {...state, server: messageReducer(state.server, action)};
    return state;
}

function settingsReducer(state, action) {
    if (isSettingsSetAction(action))
        return getNewSettings(state, action.path, action.value);
    if (isSettingsResetAction(action))
        return defaultSettings;
    return state;
}

function uiReducer(state, action, featureModel) {
    if (action.type === actionTypes.UI_SET_FEATURE_DIAGRAM_LAYOUT)
        return {...state, featureDiagramLayout: action.featureDiagramLayout};

    if (action.type === actionTypes.UI_SET_SELECT_MULTIPLE_FEATURES)
        return {...state, isSelectMultipleFeatures: action.isSelectMultipleFeatures, selectedFeatures: []};
    if (action.type === actionTypes.UI_SELECT_FEATURE)
        return {...state, selectedFeatures: [...state.selectedFeatures, action.featureName]};
    if (action.type === actionTypes.UI_SELECT_ONE_FEATURE)
        return {...state, selectedFeatures: [action.featureName]};
    if (action.type === actionTypes.UI_DESELECT_FEATURE) {
        const selectedFeatures = state.selectedFeatures.filter(featureName => featureName !== action.featureName);
        return selectedFeatures.length > 0
            ? {...state, selectedFeatures}
            : {...state, selectedFeatures, isSelectMultipleFeatures: false};
    }
    if (action.type === actionTypes.UI_SELECT_ALL_FEATURES)
        return {
            ...state,
            selectedFeatures: new FeatureModel(featureModel).getFeatureNames(),
            isSelectMultipleFeatures: true
        };
    if (action.type === actionTypes.UI_DESELECT_ALL_FEATURES)
        return {...state, selectedFeatures: [], isSelectMultipleFeatures: false};

    if (action.type === actionTypes.UI_SHOW_PANEL)
        return {...state, panel: action.panel, panelProps: action.panelProps};
    if (action.type === actionTypes.UI_SHOW_DIALOG)
        return {...state, dialog: action.dialog, dialogProps: action.dialogProps};

    return state;
}

export default reduceReducers(
    (state, action) => ({...state, ui: uiReducer(state.ui, action, state.server.featureModel)}),
    (state, action) => ({...state, settings: settingsReducer(state.settings, action)}),
    serverReducer,
    constants.store.initialState);