import messageReducer from '../server/messageReducer';
import reduceReducers from 'reduce-reducers';
import {combineActions, handleActions} from 'redux-actions';
import constants from '../constants';
import {defaultSettings, getNewSettings} from './settings';
import FeatureModel from '../server/FeatureModel';
import actions from './actions';

function serverReducer(state, action) {
    if (constants.server.isMessageType(action.type))
        return {...state, server: messageReducer(state.server, action)};
    return state;
}

const settingsReducer = handleActions({
    SETTINGS: {
        SET: (state, {payload: {path, value}}) => getNewSettings(state, path, value),
        RESET: () => defaultSettings
    }
}, null);

const uiReducer = featureModel => handleActions({
    UI: {
        SET_FEATURE_DIAGRAM_LAYOUT: (state, {payload: {featureDiagramLayout}}) =>
            ({...state, featureDiagramLayout}),
        SET_SELECT_MULTIPLE_FEATURES: (state, {payload: {isSelectMultipleFeatures}}) =>
            ({...state, isSelectMultipleFeatures, selectedFeatures: []}),
        SELECT_FEATURE: (state, {payload: {featureName}}) =>
            ({...state, selectedFeatures: [...state.selectedFeatures, featureName]}),
        SELECT_ONE_FEATURE: (state, {payload: {featureName}}) =>
            ({...state, selectedFeatures: [featureName]}),
        DESELECT_FEATURE: (state, {payload: {featureName}}) => {
            const selectedFeatures = state.selectedFeatures.filter(_featureName => _featureName !== featureName);
            return selectedFeatures.length > 0
                ? {...state, selectedFeatures}
                : {...state, selectedFeatures, isSelectMultipleFeatures: false};
        },
        SELECT_ALL_FEATURES: state => ({
            ...state,
            selectedFeatures: new FeatureModel(featureModel).getFeatureNames(),
            isSelectMultipleFeatures: true
        }),
        DESELECT_ALL_FEATURES: state =>
            ({...state, selectedFeatures: [], isSelectMultipleFeatures: false})
    },
    [combineActions(actions.ui.showPanel, actions.ui.hidePanel)]:
        (state, {payload: {panel, panelProps}}) => ({...state, panel, panelProps}),
    [combineActions(actions.ui.showDialog, actions.ui.hideDialog)]:
        (state, {payload: {dialog, dialogProps}}) => ({...state, dialog, dialogProps})
}, null);

export default reduceReducers(
    (state, action) => ({...state, ui: uiReducer(state.server.featureModel)(state.ui, action)}),
    (state, action) => ({...state, settings: settingsReducer(state.settings, action)}),
    serverReducer,
    constants.store.initialState);