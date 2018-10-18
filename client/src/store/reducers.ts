/**
 * Reducers determine the new state of the Redux store according to some given action.
 * They are implemented as pure functions only depending on the current application
 * state and the action to process, to keep state management sane.
 */

import messageReducer from '../server/messageReducer';
// @ts-ignore: the type definitions for reduce-reducers are incorrect
import reduceReducers from 'reduce-reducers';
import constants from '../constants';
import {defaultSettings, getNewSettings, getNewState, getFromState} from './settings';
import {overlayTypes, isMessageType, MessageType, Func} from '../types';
import {setAdd, setRemove} from '../helpers/reducers';
import {getFeatureModel} from './selectors';
import {getViewportWidth, getViewportHeight} from '../helpers/withDimensions';
import actions, {Action} from './actions';
import {getType, isActionOf} from 'typesafe-actions';

// TODO: fix state types.

function serverReducer(state: object, action: Action): object {
    return isMessageType(action.type)
        ? getNewState(state, 'server', messageReducer(state, action))
        : state;
}

function settingsReducer(state: object, action: Action): object {
    switch (action.type) {
        case getType(actions.settings.set):
            return getNewState(state, 'settings', getNewSettings(state, action.payload.path, action.payload.value));
        case getType(actions.settings.reset):
            return getNewState(state, 'settings', defaultSettings);
    }
    return state;
}

function removeObsoleteFeaturesFromFeatureList(state: object, key: string): object {
    if (!getFromState(state, 'server.featureModel'))
        return state;
    const featureList = getFromState(state, 'ui')[key],
        actualFeatureNames = getFeatureModel(state)!.getActualFeatureNames(),
        obsoleteFeatureNames = featureList.filter((featureName: string) => !actualFeatureNames.includes(featureName));
    return obsoleteFeatureNames.length > 0
        ? getNewState(state, `ui.${key}`, featureList.filter((featureName: string) => !obsoleteFeatureNames.includes(featureName)))
        : state;
}

function renameFeatureInFeatureList(state: object, action: Action /*TODO*/, key: string): object {
    const featureList = getFromState(state, 'ui')[key];
    return featureList.includes(action.payload.oldFeature)
        ? getNewState(state, `ui.${key}`, setAdd(setRemove(featureList, action.payload.oldFeature), action.payload.newFeature))
        : state;
}

function hideOverlayForObsoleteFeature(state: object): object {
    if (!getFromState(state, 'server.featureModel'))
        return state;
    const visibleFeatureNames = getFeatureModel(state)!.getVisibleFeatureNames();
    return getFromState(state, 'ui.overlay') && getFromState(state, 'ui.overlayProps') && getFromState(state, 'ui.overlay.overlayProps.featureName') &&
        !visibleFeatureNames.includes(getFromState(state, 'ui.overlay.overlayProps.featureName'))
        ? updateOverlay(state, undefined, undefined)
        : state;
}

function changeOverlayForRenamedFeature(state: object, action: Action /*TODO*/): object {
    return getFromState(state, 'ui.overlay') && getFromState(state, 'ui.overlayProps') &&
        getFromState(state, 'ui.overlay.overlayProps.featureName') === action.payload.oldFeature
        ? getNewState(state, 'ui.overlayProps.featureName', action.newFeature)
        : state;
}

function finalReducer(state: object, action: Action): object {
    if (action.type === MessageType.FEATURE_DIAGRAM_FEATURE_MODEL) { // TODO
        state = removeObsoleteFeaturesFromFeatureList(state, 'collapsedFeatureNames');
        // TODO: warn user that selection changed
        state = removeObsoleteFeaturesFromFeatureList(state, 'selectedFeatureNames');
        // TODO: warn user that overlay was hidden
        state = hideOverlayForObsoleteFeature(state);
    }
    if (action.type === MessageType.FEATURE_DIAGRAM_FEATURE_RENAME) {
        state = renameFeatureInFeatureList(state, action, 'collapsedFeatureNames');
        state = renameFeatureInFeatureList(state, action, 'selectedFeatureNames');
        state = changeOverlayForRenamedFeature(state, action);
    }
    if (isActionOf(actions.ui.featureDiagram.fitToScreen, action))
        state = getNewState(state, 'settings', getNewSettings(getFromState(state, 'settings'), 'featureDiagram.forceRerender', +new Date()));
    return state;
}

function updateOverlay(state: object, overlay?: string, overlayProps?: object): object {
    if (!getFromState(state, 'ui.isSelectMultipleFeatures') &&
        overlayTypes.isFloatingFeature(getFromState(state, 'ui.overlay')) &&
        !overlayTypes.isFloatingFeature(overlay))
        return getNewState(state, 'ui.overlay', overlay, 'ui.overlayProps', overlayProps, 'ui.selectedFeatureNames', []);
    else
        return getNewState(state, 'ui.overlay', overlay, 'ui.overlayProps', overlayProps);
}

function getFeatureNamesBelowWithActualChildren(state: object, featureNames: string[]): string[] {
    if (!getFromState(state, 'server.featureModel'))
        throw new Error('no feature model available');
    return featureNames.map(featureName =>
        getFeatureModel(state)!.getFeatureNamesBelowWithActualChildren(featureName))
        .reduce((acc, children) => acc.concat(children), []);
}

function uiReducer(state: object, action: Action): object {
    let selectedFeatureNames: string[], setOperation: Func;

    switch (action.type) {
        case getType(actions.ui.featureDiagram.setLayout):
            return getNewState(state, 'ui.featureDiagram.layout', action.payload.layout);

        case getType(actions.ui.featureDiagram.fitToScreen):
            return getFromState(state, 'server.featureModel')
                ? getNewState(state, 'ui.collapsedFeatureNames',
                    getFeatureModel(state)!.getFittingFeatureNames(
                        getFromState(state, 'settings'), getFromState(state, 'ui.featureDiagram.layout'),
                        getViewportWidth(), getViewportHeight()))
                : state;

        case getType(actions.ui.featureDiagram.feature.setSelectMultiple):
            return getNewState(state,
                'ui.isSelectMultipleFeatures', action.payload.isSelectMultipleFeatures,
                'ui.selectedFeatureNames', []);

        case getType(actions.ui.featureDiagram.feature.select):
            return getNewState(state, 'ui.selectedFeatureNames',
                setAdd(getFromState(state, 'ui.selectedFeatureNames'), action.payload.featureName));

        case getType(actions.ui.featureDiagram.feature.deselect):
            selectedFeatureNames = setRemove(getFromState(state, 'ui.selectedFeatureNames'), action.payload.featureName);
            return selectedFeatureNames.length > 0
                ? getNewState(state, 'ui.selectedFeatureNames', selectedFeatureNames)
                : getNewState(state, 'ui.selectedFeatureNames', selectedFeatureNames, 'ui.isSelectMultipleFeatures', false);

        case getType(actions.ui.featureDiagram.feature.selectAll):
            return getFromState(state, 'server.featureModel')
                ? getNewState(state,
                    'ui.selectedFeatureNames', getFeatureModel(state)!.getVisibleFeatureNames(),
                    'ui.isSelectMultipleFeatures', true)
                : state;

        case getType(actions.ui.featureDiagram.feature.deselectAll):
            return getNewState(state,
                'ui.selectedFeatureNames', [],
                'ui.isSelectMultipleFeatures', false);

        case getType(actions.ui.featureDiagram.feature.collapse):
        case getType(actions.ui.featureDiagram.feature.expand):
            setOperation = isActionOf(actions.ui.featureDiagram.feature.collapse, action) ? setAdd : setRemove;
            return getNewState(state, 'ui.collapsedFeatureNames',
                setOperation(getFromState(state, 'ui.collapsedFeatureNames'), action.payload.featureNames));

        case getType(actions.ui.featureDiagram.feature.collapseAll):
            return getFromState(state, 'server.featureModel')
                ? getNewState(state,
                    'ui.collapsedFeatureNames', getFeatureModel(state)!.getFeatureNamesWithActualChildren())
                : state;

        case getType(actions.ui.featureDiagram.feature.expandAll):
            return getNewState(state, 'ui.collapsedFeatureNames', []);

        case getType(actions.ui.featureDiagram.feature.collapseBelow):
        case getType(actions.ui.featureDiagram.feature.expandBelow):
            setOperation = isActionOf(actions.ui.featureDiagram.feature.collapse, action) ? setAdd : setRemove;
            return getFromState(state, 'server.featureModel')
                ? getNewState(state, 'ui.collapsedFeatureNames',
                    setOperation(getFromState(state, 'ui.collapsedFeatureNames'),
                        getFeatureNamesBelowWithActualChildren(state, action.payload.featureNames)))
                : state;

        case getType(actions.ui.overlay.show):
            let newState = updateOverlay(state, action.payload.overlay, action.payload.overlayProps);
            if (action.payload.selectOneFeature)
                newState = getNewState(newState, 'ui.selectedFeatureNames', [action.payload.selectOneFeature]);
            return newState;

        case getType(actions.ui.overlay.hide):
            return getFromState(state, 'ui.overlay') === action.payload.overlay
                ? updateOverlay(state, undefined, undefined)
                : state;
    }

    return state;
}

export default reduceReducers(
    serverReducer,
    settingsReducer,
    uiReducer,
    finalReducer,
    constants.store.initialState);