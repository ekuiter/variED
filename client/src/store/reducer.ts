/**
 * The reducer determines the new state of the Redux store according to some given action.
 * They are implemented as pure functions only depending on the current application
 * state and the action to process, to keep state management sane.
 */

// @ts-ignore: the type definitions for reduce-reducers are incorrect
import reduceReducers from 'reduce-reducers';
import {defaultSettings, getNewSettings} from './settings';
import {OverlayType, isMessageType, MessageType, isFloatingFeatureOverlay, OverlayProps} from '../types';
import {setAdd, setRemove, SetOperationFunction} from '../helpers/reducer';
import {getFeatureModel} from './selectors';
import {getViewportWidth, getViewportHeight} from '../helpers/withDimensions';
import actions, {Action} from './actions';
import {getType, isActionOf, ActionType} from 'typesafe-actions';
import {State, initialState} from './types';
import objectPath from 'object-path';
import objectPathImmutable from 'object-path-immutable';
import logger from '../helpers/logger';

function getNewState(state: State, ...args: any[]): State {
    if (args.length % 2 == 1)
        throw new Error('getNewState expects pairs of path and value');
    for (let i = 0; i < args.length; i += 2) {
        if (typeof args[i] !== 'string')
            throw new Error('string expected for path');

        if (!objectPath.has(state, args[i]))
            throw new Error(`path ${args[i]} does not exist`);
        state = objectPathImmutable.set(state, args[i], args[i + 1]);
    }
    return state;
}

function removeObsoleteFeaturesFromFeatureList(state: State, key: string): State {
    if (!state.server.featureModel)
        return state;
    const featureList = state.ui.featureDiagram[key],
        actualFeatureNames = getFeatureModel(state)!.getActualFeatureNames(),
        obsoleteFeatureNames = featureList.filter((featureName: string) => !actualFeatureNames.includes(featureName));
    return obsoleteFeatureNames.length > 0
        ? getNewState(state, `ui.featureDiagram.${key}`, featureList.filter((featureName: string) => !obsoleteFeatureNames.includes(featureName)))
        : state;
}

function renameFeatureInFeatureList(state: State, action: ActionType<typeof actions.server.receive>, key: string): State {
    const featureList = state.ui.featureDiagram[key];
    return featureList.includes(action.payload.oldFeature)
        ? getNewState(state, `ui.featureDiagram.${key}`, setAdd(setRemove(featureList, action.payload.oldFeature), action.payload.newFeature))
        : state;
}

function hideOverlayForObsoleteFeature(state: State): State {
    if (!state.server.featureModel)
        return state;
    const visibleFeatureNames = getFeatureModel(state)!.getVisibleFeatureNames();
    return state.ui.overlay !== OverlayType.none && state.ui.overlayProps.featureName &&
        !visibleFeatureNames.includes(state.ui.overlayProps.featureName)
        ? updateOverlay(state, OverlayType.none, {})
        : state;
}

function changeOverlayForRenamedFeature(state: State, action: ActionType<typeof actions.server.receive>): State {
    return state.ui.overlay !== OverlayType.none && state.ui.overlayProps.featureName === action.payload.oldFeature
        ? getNewState(state, 'ui.overlayProps.featureName', action.payload.newFeature)
        : state;
}

function updateOverlay(state: State, overlay: OverlayType, overlayProps: OverlayProps): State {
    if (!state.ui.featureDiagram.isSelectMultipleFeatures &&
        isFloatingFeatureOverlay(state.ui.overlay) &&
        !isFloatingFeatureOverlay(overlay))
        return getNewState(state, 'ui.overlay', overlay, 'ui.overlayProps', overlayProps, 'ui.featureDiagram.selectedFeatureNames', []);
    else
        return getNewState(state, 'ui.overlay', overlay, 'ui.overlayProps', overlayProps);
}

function getFeatureNamesBelowWithActualChildren(state: State, featureNames: string[]): string[] {
    if (!state.server.featureModel)
        throw new Error('no feature model available');
    return featureNames.map(featureName =>
        getFeatureModel(state)!.getFeatureNamesBelowWithActualChildren(featureName))
        .reduce((acc, children) => acc.concat(children), []);
}

function serverReducer(state: State, action: Action): State {
    if (isActionOf(actions.server.receive, action) && isMessageType(action.payload.type)) {
        switch (action.payload.type) {
            case MessageType.ERROR:
                logger.warnTagged({tag: 'server'}, () => action.payload.error);
                return state;

            case MessageType.JOIN:
                return getNewState(state, 'server.users', setAdd(state.server.users, action.payload.user));

            case MessageType.LEAVE:
                return getNewState(state, 'server.users', setRemove(state.server.users, action.payload.user));

            case MessageType.FEATURE_DIAGRAM_FEATURE_MODEL:
                state = getNewState(state, 'server.featureModel', action.payload.featureModel);
                state = removeObsoleteFeaturesFromFeatureList(state, 'collapsedFeatureNames');
                // TODO: warn user that selection changed
                state = removeObsoleteFeaturesFromFeatureList(state, 'selectedFeatureNames');
                // state: warn user that overlay was hidden
                state = hideOverlayForObsoleteFeature(state);
                return state;

            case MessageType.FEATURE_DIAGRAM_FEATURE_RENAME:
                state = renameFeatureInFeatureList(state, action, 'collapsedFeatureNames');
                state = renameFeatureInFeatureList(state, action, 'selectedFeatureNames');
                state = changeOverlayForRenamedFeature(state, action);
                return state;

            default:
                logger.warn(() => `no message reducer defined for action type ${action.payload.type}`);
                return state;
        }
    }
    return state;
}

function settingsReducer(state: State, action: Action): State {
    switch (action.type) {
        case getType(actions.settings.set):
            return getNewState(state, 'settings', getNewSettings(state.settings, action.payload.path, action.payload.value));

        case getType(actions.settings.reset):
            return getNewState(state, 'settings', defaultSettings);
    }
    return state;
}

function uiReducer(state: State, action: Action): State {
    let selectedFeatureNames: string[], setOperation: SetOperationFunction<string>;

    switch (action.type) {
        case getType(actions.ui.featureDiagram.setLayout):
            return getNewState(state, 'ui.featureDiagram.layout', action.payload.layout);

        case getType(actions.ui.featureDiagram.fitToScreen):
            return state.server.featureModel
                ? getNewState(state,
                    'ui.featureDiagram.collapsedFeatureNames', getFeatureModel(state)!.getFittingFeatureNames(
                        state.settings, state.ui.featureDiagram.layout, getViewportWidth(), getViewportHeight()),
                    'settings', getNewSettings(state.settings, 'featureDiagram.forceRerender', +new Date()))
                : state;

        case getType(actions.ui.featureDiagram.feature.setSelectMultiple):
            return getNewState(state,
                'ui.featureDiagram.isSelectMultipleFeatures', action.payload.isSelectMultipleFeatures,
                'ui.featureDiagram.selectedFeatureNames', []);

        case getType(actions.ui.featureDiagram.feature.select):
            return getNewState(state, 'ui.featureDiagram.selectedFeatureNames',
                setAdd(state.ui.featureDiagram.selectedFeatureNames, action.payload.featureName));

        case getType(actions.ui.featureDiagram.feature.deselect):
            selectedFeatureNames = setRemove(state.ui.featureDiagram.selectedFeatureNames, action.payload.featureName);
            return selectedFeatureNames.length > 0
                ? getNewState(state, 'ui.featureDiagram.selectedFeatureNames', selectedFeatureNames)
                : getNewState(state, 'ui.featureDiagram.selectedFeatureNames', selectedFeatureNames, 'ui.featureDiagram.isSelectMultipleFeatures', false);

        case getType(actions.ui.featureDiagram.feature.selectAll):
            return state.server.featureModel
                ? getNewState(state,
                    'ui.featureDiagram.selectedFeatureNames', getFeatureModel(state)!.getVisibleFeatureNames(),
                    'ui.featureDiagram.isSelectMultipleFeatures', true)
                : state;

        case getType(actions.ui.featureDiagram.feature.deselectAll):
            return getNewState(state,
                'ui.featureDiagram.selectedFeatureNames', [],
                'ui.featureDiagram.isSelectMultipleFeatures', false);

        case getType(actions.ui.featureDiagram.feature.collapse):
        case getType(actions.ui.featureDiagram.feature.expand):
            setOperation = isActionOf(actions.ui.featureDiagram.feature.collapse, action) ? setAdd : setRemove;
            return getNewState(state, 'ui.featureDiagram.collapsedFeatureNames',
                setOperation(state.ui.featureDiagram.collapsedFeatureNames, action.payload.featureNames));

        case getType(actions.ui.featureDiagram.feature.collapseAll):
            return state.server.featureModel
                ? getNewState(state,
                    'ui.featureDiagram.collapsedFeatureNames', getFeatureModel(state)!.getFeatureNamesWithActualChildren())
                : state;

        case getType(actions.ui.featureDiagram.feature.expandAll):
            return getNewState(state, 'ui.featureDiagram.collapsedFeatureNames', []);

        case getType(actions.ui.featureDiagram.feature.collapseBelow):
        case getType(actions.ui.featureDiagram.feature.expandBelow):
            setOperation = isActionOf(actions.ui.featureDiagram.feature.collapseBelow, action) ? setAdd : setRemove;
            return state.server.featureModel
                ? getNewState(state, 'ui.featureDiagram.collapsedFeatureNames',
                    setOperation(state.ui.featureDiagram.collapsedFeatureNames,
                        getFeatureNamesBelowWithActualChildren(state, action.payload.featureNames)))
                : state;

        case getType(actions.ui.overlay.show):
            state = updateOverlay(state, action.payload.overlay, action.payload.overlayProps);
            if (action.payload.selectOneFeature)
                state = getNewState(state, 'ui.featureDiagram.selectedFeatureNames', [action.payload.selectOneFeature]);
            return state;

        case getType(actions.ui.overlay.hide):
            return state.ui.overlay === action.payload.overlay
                ? updateOverlay(state, OverlayType.none, {})
                : state;
    }

    return state;
}

export default <(state?: State, action?: Action) => State>
    reduceReducers(
        (state: State, action: Action) => {
            logger.infoTagged({tag: 'redux'}, () => action);
            return state;
        },
        serverReducer,
        settingsReducer,
        uiReducer,
        initialState);