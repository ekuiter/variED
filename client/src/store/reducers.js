import messageReducer from '../server/messageReducer';
import reduceReducers from 'reduce-reducers';
import {handleActions} from 'redux-actions';
import constants from '../constants';
import {defaultSettings, getNewSettings} from './settings';
import {overlayTypes} from '../types';
import {uniqueArrayAdd, uniqueArrayRemove} from '../helpers/reducers';
import {getFeatureModel} from './selectors';

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

function stateWithNewUi(state, key, value) {
    return {
        ...state,
        ui: {
            ...state.ui,
            [key]: value
        }
    };
}

function handleFeatureRename(state, action, key) {
    if (state.ui[key].includes(action.oldFeature))
        return stateWithNewUi(state, key, uniqueArrayAdd(state.ui[key], action.newFeature));
    return state;
}

function serverUiReducer(state, action) {
    if (action.type === constants.server.messageTypes.FEATURE_MODEL) {
        const actualFeatureNames = getFeatureModel(state).getActualFeatureNames(),
            exitingFeatureNames = state.ui.collapsedFeatureNames
                .filter(collapsedFeatureName => !actualFeatureNames.includes(collapsedFeatureName));
        if (exitingFeatureNames.length > 0)
            return stateWithNewUi(state, 'collapsedFeatureNames',
                state.ui.collapsedFeatureNames
                    .filter(collapsedFeatureName => !exitingFeatureNames.includes(collapsedFeatureName)))
    }
    if (action.type === constants.server.messageTypes.FEATURE_RENAME) {
        state = handleFeatureRename(state, action, 'collapsedFeatureNames');
        state = handleFeatureRename(state, action, 'selectedFeatureNames');
    }
    return state;
}

function updateOverlay(state, overlay, overlayProps) {
    if (!state.isSelectMultipleFeatures &&
        overlayTypes.isShownAtSelectedFeature(state.overlay) &&
        !overlayTypes.isShownAtSelectedFeature(overlay))
        return {...state, overlay, overlayProps, selectedFeatureNames: []};
    else
        return {...state, overlay, overlayProps};
}

const uiReducer = rootState => handleActions({
    UI: {
        SET_FEATURE_DIAGRAM_LAYOUT: (state, {payload: {featureDiagramLayout}}) =>
            ({...state, featureDiagramLayout}),
        SET_SELECT_MULTIPLE_FEATURES: (state, {payload: {isSelectMultipleFeatures}}) =>
            ({...state, isSelectMultipleFeatures, selectedFeatureNames: []}),
        SELECT_FEATURE: (state, {payload: {featureName}}) =>
            ({...state, selectedFeatureNames: uniqueArrayAdd(state.selectedFeatureNames, featureName)}),
        DESELECT_FEATURE: (state, {payload: {featureName}}) => {
            const selectedFeatureNames = uniqueArrayRemove(state.selectedFeatureNames, featureName);
            return selectedFeatureNames.length > 0
                ? {...state, selectedFeatureNames}
                : {...state, selectedFeatureNames, isSelectMultipleFeatures: false};
        },
        SELECT_ALL_FEATURES: state => ({
            ...state,
            selectedFeatureNames: getFeatureModel(rootState).getVisibleFeatureNames(),
            isSelectMultipleFeatures: true
        }),
        DESELECT_ALL_FEATURES: state =>
            ({...state, selectedFeatureNames: [], isSelectMultipleFeatures: false}),
        COLLAPSE_FEATURE: (state, {payload: {featureName}}) =>
            ({...state, collapsedFeatureNames: uniqueArrayAdd(state.collapsedFeatureNames, featureName)}),
        EXPAND_FEATURE: (state, {payload: {featureName}}) =>
            ({...state, collapsedFeatureNames: uniqueArrayRemove(state.collapsedFeatureNames, featureName)}),
        SHOW_OVERLAY:
            (state, {payload: {overlay, overlayProps, selectFeature}}) => {
                let newState = updateOverlay(state, overlay, overlayProps);
                if (selectFeature)
                    newState.selectedFeatureNames = [...newState.selectedFeatureNames, selectFeature];
                return newState;
            },
        HIDE_OVERLAY: (state, {payload: {overlay}}) =>
            state.overlay === overlay ? updateOverlay(state, null, null) : state
    },
}, null);

export default reduceReducers(
    serverReducer,
    (state, action) => ({...state, settings: settingsReducer(state.settings, action)}),
    (state, action) => ({...state, ui: uiReducer(state)(state.ui, action)}),
    serverUiReducer,
    constants.store.initialState);