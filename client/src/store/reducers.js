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

function removeObsoleteFeaturesFromFeatureList(state, key) {
    const actualFeatureNames = getFeatureModel(state).getActualFeatureNames(),
        obsoleteFeatureNames = state.ui[key].filter(featureName => !actualFeatureNames.includes(featureName));
    if (obsoleteFeatureNames.length > 0)
        return stateWithNewUi(state, key,
            state.ui[key].filter(featureName => !obsoleteFeatureNames.includes(featureName)));
    return state;
}

function renameFeatureInFeatureList(state, action, key) {
    if (state.ui[key].includes(action.oldFeature))
        return stateWithNewUi(state, key,
            uniqueArrayAdd(uniqueArrayRemove(state.ui[key], action.oldFeature), action.newFeature));
    return state;
}

function hideOverlayForObsoleteFeature(state) {
    const visibleFeatureNames = getFeatureModel(state).getVisibleFeatureNames();
    if (state.ui.overlay && state.ui.overlayProps && state.ui.overlayProps.featureName &&
        !visibleFeatureNames.includes(state.ui.overlayProps.featureName))
        return updateOverlay(state, null, null);
    return state;
}

function changeOverlayForRenamedFeature(state, action) {
    if (state.ui.overlay && state.ui.overlayProps && state.ui.overlayProps.featureName === action.oldFeature)
        return stateWithNewUi(state, 'overlayProps', {...state.ui.overlayProps, featureName: action.newFeature});
    return state;
}

function serverUiReducer(state, action) {
    if (action.type === constants.server.messageTypes.FEATURE_MODEL) {
        state = removeObsoleteFeaturesFromFeatureList(state, 'collapsedFeatureNames');
        // TODO: warn user that selection changed
        state = removeObsoleteFeaturesFromFeatureList(state, 'selectedFeatureNames');
        // TODO: warn user that overlay was hidden
        state = hideOverlayForObsoleteFeature(state);
    }
    if (action.type === constants.server.messageTypes.FEATURE_RENAME) {
        state = renameFeatureInFeatureList(state, action, 'collapsedFeatureNames');
        state = renameFeatureInFeatureList(state, action, 'selectedFeatureNames');
        state = changeOverlayForRenamedFeature(state, action);
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
        FEATURE: {
            SELECT: (state, {payload: {featureName}}) =>
                ({...state, selectedFeatureNames: uniqueArrayAdd(state.selectedFeatureNames, featureName)}),
            DESELECT: (state, {payload: {featureName}}) => {
                const selectedFeatureNames = uniqueArrayRemove(state.selectedFeatureNames, featureName);
                return selectedFeatureNames.length > 0
                    ? {...state, selectedFeatureNames}
                    : {...state, selectedFeatureNames, isSelectMultipleFeatures: false};
            },
            COLLAPSE: (state, {payload: {featureName}}) =>
                ({...state, collapsedFeatureNames: uniqueArrayAdd(state.collapsedFeatureNames, featureName)}),
            EXPAND: (state, {payload: {featureName}}) =>
                ({...state, collapsedFeatureNames: uniqueArrayRemove(state.collapsedFeatureNames, featureName)})
        },
        FEATURES: {
            SET_SELECT_MULTIPLE: (state, {payload: {isSelectMultipleFeatures}}) =>
                ({...state, isSelectMultipleFeatures, selectedFeatureNames: []}),
            SELECT_ALL: state =>
                rootState.server.featureModel
                    ? {
                        ...state,
                        selectedFeatureNames: getFeatureModel(rootState).getVisibleFeatureNames(),
                        isSelectMultipleFeatures: true
                    }
                    : state,
            DESELECT_ALL: state =>
                ({...state, selectedFeatureNames: [], isSelectMultipleFeatures: false}),
            COLLAPSE_ALL: state => 
                rootState.server.featureModel
                    ? {
                        ...state,
                        collapsedFeatureNames: getFeatureModel(rootState).getFeatureNamesWithActualChildren()
                    }
                    : state,
            EXPAND_ALL: state => ({...state, collapsedFeatureNames: []})
        },
        OVERLAY: {
            SHOW: (state, {payload: {overlay, overlayProps, selectOneFeature}}) => {
                let newState = updateOverlay(state, overlay, overlayProps);
                if (selectOneFeature)
                    newState.selectedFeatureNames = [selectOneFeature];
                return newState;
            },
            HIDE: (state, {payload: {overlay}}) =>
                state.overlay === overlay ? updateOverlay(state, null, null) : state
        }
    },
}, null);

export default reduceReducers(
    serverReducer,
    (state, action) => ({...state, settings: settingsReducer(state.settings, action)}),
    (state, action) => ({...state, ui: uiReducer(state)(state.ui, action)}),
    serverUiReducer,
    constants.store.initialState);