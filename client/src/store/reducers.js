import messageReducer from '../server/messageReducer';
import reduceReducers from 'reduce-reducers';
import {combineActions, handleActions} from 'redux-actions';
import constants from '../constants';
import {defaultSettings, getNewSettings} from './settings';
import FeatureModel from '../server/FeatureModel';
import actions from './actions';
import {overlayTypes} from '../containers/overlays/OverlayContainer';

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
            ({...state, isSelectMultipleFeatures, selectedFeatureNames: []}),
        SELECT_FEATURE: (state, {payload: {featureName}}) =>
            ({...state, selectedFeatureNames: [...state.selectedFeatureNames, featureName]}),
        DESELECT_FEATURE: (state, {payload: {featureName}}) => {
            const selectedFeatureNames = state.selectedFeatureNames.filter(_featureName => _featureName !== featureName);
            return selectedFeatureNames.length > 0
                ? {...state, selectedFeatureNames}
                : {...state, selectedFeatureNames, isSelectMultipleFeatures: false};
        },
        SELECT_ALL_FEATURES: state => ({
            ...state,
            selectedFeatureNames: new FeatureModel(featureModel).getFeatureNames(),
            isSelectMultipleFeatures: true
        }),
        DESELECT_ALL_FEATURES: state =>
            ({...state, selectedFeatureNames: [], isSelectMultipleFeatures: false})
    },
    [combineActions(actions.ui.showOverlay, actions.ui.hideOverlay)]:
        (state, {payload: {overlay, overlayProps, selectFeature}}) => {
            let newState;
            if (!state.isSelectMultipleFeatures &&
                overlayTypes.isShownAtSelectedFeature(state.overlay) &&
                !overlayTypes.isShownAtSelectedFeature(overlay))
                newState = {...state, overlay, overlayProps, selectedFeatureNames: []};
            else
                newState = {...state, overlay, overlayProps};
            if (selectFeature)
                newState.selectedFeatureNames = [...newState.selectedFeatureNames, selectFeature];
            return newState;
        },
}, null);

export default reduceReducers(
    (state, action) => ({...state, ui: uiReducer(state.server.featureModel)(state.ui, action)}),
    (state, action) => ({...state, settings: settingsReducer(state.settings, action)}),
    serverReducer,
    constants.store.initialState);