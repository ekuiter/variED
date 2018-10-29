/**
 * The reducer determines the new state of the Redux store according to some given action.
 * They are implemented as pure functions only depending on the current application
 * state and the action to process, to keep state management sane.
 */

// @ts-ignore: the type definitions for reduce-reducers are incorrect
import reduceReducers from 'reduce-reducers';
import {defaultSettings, getNewSettings} from './settings';
import {OverlayType, isMessageType, MessageType, isFloatingFeatureOverlay, OverlayProps, isArtifactPathEqual, ArtifactPath, Message} from '../types';
import {setAdd, setRemove, SetOperationFunction, arrayReplace} from '../helpers/array';
import {getFeatureModel, isEditingFeatureModel, getCollaborativeSession, getCurrentFeatureModel, getCurrentCollaborativeSession, isFeatureDiagramCollaborativeSession} from './selectors';
import {getViewportWidth, getViewportHeight} from '../helpers/withDimensions';
import actions, {Action, SERVER_SEND_MESSAGE} from './actions';
import {getType, isActionOf, ActionType} from 'typesafe-actions';
import {State, initialState, CollaborativeSession, FeatureDiagramCollaborativeSession, initialFeatureDiagramCollaborativeSessionState} from './types';
import objectPath from 'object-path';
import objectPathImmutable from 'object-path-immutable';
import logger, {setLogLevel, LogLevel, defaultLogLevel} from '../helpers/logger';
import {AnyAction} from 'redux';

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

function getNewCollaborativeSessions(state: State, artifactPath: ArtifactPath,
    replacementFn: (collaborativeSession: CollaborativeSession) => CollaborativeSession): CollaborativeSession[] {
    getCollaborativeSession(state, artifactPath);
    return arrayReplace(state.collaborativeSessions,
        collaborativeSession => isArtifactPathEqual(collaborativeSession.artifactPath, artifactPath),
        replacementFn);
}

function removeObsoleteFeaturesFromFeatureList(state: State, artifactPath: ArtifactPath, key: string): State {
    const featureList = getCollaborativeSession(state, artifactPath)[key],
        actualFeatureNames = getFeatureModel(state, artifactPath)!.getActualFeatureNames(),
        obsoleteFeatureNames = featureList.filter((featureName: string) => !actualFeatureNames.includes(featureName));
    return obsoleteFeatureNames.length > 0
        ? getNewState(state, 'collaborativeSessions',
            getNewCollaborativeSessions(state, artifactPath, (collaborativeSession: CollaborativeSession) =>
                ({...collaborativeSession, [key]: featureList.filter((featureName: string) => !obsoleteFeatureNames.includes(featureName))})))
        : state;
}

function renameFeatureInFeatureList(state: State, action: ActionType<typeof actions.server.receive>, key: string): State {
    const featureList = getCollaborativeSession(state, action.payload.artifactPath!)[key];
    return featureList.includes(action.payload.oldFeature)
        ? getNewState(state, 'collaborativeSessions',
            getNewCollaborativeSessions(state, action.payload.artifactPath!, (collaborativeSession: CollaborativeSession) =>
                ({...collaborativeSession, [key]: setAdd(setRemove(featureList, action.payload.oldFeature), action.payload.newFeature)})))
        : state;
}

function hideOverlayForObsoleteFeature(state: State): State {
    if (!isEditingFeatureModel(state))
        return state;
    const visibleFeatureNames = getCurrentFeatureModel(state)!.getVisibleFeatureNames();
    return state.overlay !== OverlayType.none && state.overlayProps.featureName &&
        !visibleFeatureNames.includes(state.overlayProps.featureName)
        ? updateOverlay(state, OverlayType.none, {})
        : state;
}

function changeOverlayForRenamedFeature(state: State, action: ActionType<typeof actions.server.receive>): State {
    return state.overlay !== OverlayType.none && state.overlayProps.featureName === action.payload.oldFeature
        ? getNewState(state, 'overlayProps.featureName', action.payload.newFeature)
        : state;
}

function updateOverlay(state: State, overlay: OverlayType, overlayProps: OverlayProps): State {
    const collaborativeSession = getCurrentCollaborativeSession(state);
    if (isFeatureDiagramCollaborativeSession(collaborativeSession) &&
        !collaborativeSession.isSelectMultipleFeatures &&
        isFloatingFeatureOverlay(state.overlay) &&
        !isFloatingFeatureOverlay(overlay))
        return getNewState(state, 'overlay', overlay, 'overlayProps', overlayProps,
            'collaborativeSessions',
            getNewCollaborativeSessions(state, state.currentArtifactPath!, (collaborativeSession: CollaborativeSession) =>
                ({...collaborativeSession, selectedFeatureNames: []})));
    else
        return getNewState(state, 'overlay', overlay, 'overlayProps', overlayProps);
}

function getFeatureNamesBelowWithActualChildren(state: State, artifactPath: ArtifactPath, featureNames: string[]): string[] {
    return featureNames.map(featureName =>
        getFeatureModel(state, artifactPath)!.getFeatureNamesBelowWithActualChildren(featureName))
        .reduce((acc, children) => acc.concat(children), []);
}

function serverSendReducer(state: State, action: AnyAction): State {
    if (action.type === SERVER_SEND_MESSAGE) {
        const messages: Message[] = Array.isArray(action.payload) ? action.payload : [action.payload];
        return messages.reduce((state, message) => {
            switch (message.type) {
                case MessageType.LEAVE:
                    // TODO: we just assume that leaving succeeds here. It would be better to wait for the server's
                    // acknowledgement (and use promises in actions.ts to dispatch this update), see issue #9.
                    // Also right now, when the server kicks us from a session, we do not handle this.
                    return getNewState(state,
                        'collaborativeSessions',
                            state.collaborativeSessions.filter(collaborativeSession =>
                                !isArtifactPathEqual(collaborativeSession.artifactPath, message.artifactPath)),
                        'currentArtifactPath',
                            isArtifactPathEqual(state.currentArtifactPath, action.payload.artifactPath!)
                            ? undefined
                            : state.currentArtifactPath);

                default:
                    return state;
            }
        }, state);
    }
    return state;
}

function serverReceiveReducer(state: State, action: Action): State {
    if (isActionOf(actions.server.receive, action) && isMessageType(action.payload.type)) {
        switch (action.payload.type) {
            case MessageType.ERROR:
                logger.warnTagged({tag: 'server'}, () => action.payload.error);
                return state;

            case MessageType.JOIN:
                return getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, action.payload.artifactPath!, (collaborativeSession: CollaborativeSession) =>
                        ({...collaborativeSession, users: setAdd(collaborativeSession.users, action.payload.user)})));

            case MessageType.LEAVE:
                return getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, action.payload.artifactPath!, (collaborativeSession: CollaborativeSession) =>
                        ({...collaborativeSession, users: setRemove(collaborativeSession.users, action.payload.user)})));

            case MessageType.FEATURE_DIAGRAM_FEATURE_MODEL:
                if (state.collaborativeSessions.find(collaborativeSession =>
                    isArtifactPathEqual(collaborativeSession.artifactPath, action.payload.artifactPath!)))
                    state = getNewState(state, 'collaborativeSessions',
                        getNewCollaborativeSessions(state, action.payload.artifactPath!,
                            (collaborativeSession: CollaborativeSession) =>
                                ({...collaborativeSession, featureModel: action.payload.featureModel})));
                else
                    state = getNewState(state,
                        'collaborativeSessions', [...state.collaborativeSessions,
                            initialFeatureDiagramCollaborativeSessionState(action.payload.artifactPath!, action.payload.featureModel)],
                        'currentArtifactPath', action.payload.artifactPath!);
                state = removeObsoleteFeaturesFromFeatureList(state, action.payload.artifactPath!, 'collapsedFeatureNames');
                // TODO: warn user that selection change
                state = removeObsoleteFeaturesFromFeatureList(state, action.payload.artifactPath!, 'selectedFeatureNames');
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
            if (action.payload.path === 'debug') {
                // just for once, we allow side-effects in a reducer: when the debug flag is set or cleared,
                // the log level is adjusted accordingly.
                const newDebug = typeof action.payload.value === 'function' ? action.payload.value(state.settings.debug) : action.payload.value;
                setLogLevel(newDebug ? LogLevel.info : defaultLogLevel);
            }
            return getNewState(state, 'settings', getNewSettings(state.settings, action.payload.path, action.payload.value));

        case getType(actions.settings.reset):
            return getNewState(state, 'settings', defaultSettings);
    }
    return state;
}

function uiReducer(state: State, action: Action): State {
    let setOperation: SetOperationFunction<string>;

    switch (action.type) {
        case getType(actions.ui.setCurrentArtifactPath):
            return getNewState(state, 'currentArtifactPath', action.payload.artifactPath);

        case getType(actions.ui.featureDiagram.setLayout):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, state.currentArtifactPath!, (collaborativeSession: CollaborativeSession) =>
                        ({...collaborativeSession, layout: action.payload.layout})))
                : state;

        case getType(actions.ui.featureDiagram.fitToScreen):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, state.currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        collapsedFeatureNames: getCurrentFeatureModel(state)!.getFittingFeatureNames(
                            state.settings, (<FeatureDiagramCollaborativeSession>collaborativeSession).layout,
                            getViewportWidth(), getViewportHeight())
                    })),
                    'settings', getNewSettings(state.settings, 'featureDiagram.forceRerender', +new Date()))
                : state;

        case getType(actions.ui.featureDiagram.feature.setSelectMultiple):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, state.currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        isSelectMultipleFeatures: action.payload.isSelectMultipleFeatures,
                        selectedFeatureNames: []
                    })))
                : state;

        case getType(actions.ui.featureDiagram.feature.select):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, state.currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        selectedFeatureNames: setAdd(
                            (<FeatureDiagramCollaborativeSession>collaborativeSession).selectedFeatureNames,
                            action.payload.featureName)
                    })))
                : state;

        case getType(actions.ui.featureDiagram.feature.deselect):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, state.currentArtifactPath!, (collaborativeSession: CollaborativeSession) => {
                        const selectedFeatureNames = setRemove(
                            (<FeatureDiagramCollaborativeSession>collaborativeSession).selectedFeatureNames,
                            action.payload.featureName);
                        return selectedFeatureNames.length > 0
                            ? {...collaborativeSession, selectedFeatureNames}
                            : {...collaborativeSession, selectedFeatureNames, isSelectMultipleFeatures: false};
                    }))
                : state;

        case getType(actions.ui.featureDiagram.feature.selectAll):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, state.currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        selectedFeatureNames: getCurrentFeatureModel(state)!.getVisibleFeatureNames(),
                        isSelectMultipleFeatures: true
                    })))
                : state;

        case getType(actions.ui.featureDiagram.feature.deselectAll):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, state.currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        selectedFeatureNames: [],
                        isSelectMultipleFeatures: false
                    })))
                : state;

        case getType(actions.ui.featureDiagram.feature.collapse):
        case getType(actions.ui.featureDiagram.feature.expand):
            setOperation = isActionOf(actions.ui.featureDiagram.feature.collapse, action) ? setAdd : setRemove;
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, state.currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        collapsedFeatureNames: setOperation(
                            (<FeatureDiagramCollaborativeSession>collaborativeSession).collapsedFeatureNames,
                            action.payload.featureNames)
                    })))
                    : state;

        case getType(actions.ui.featureDiagram.feature.collapseAll):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, state.currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        collapsedFeatureNames: getCurrentFeatureModel(state)!.getFeatureNamesWithActualChildren()
                    })))
                : state;

        case getType(actions.ui.featureDiagram.feature.expandAll):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, state.currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        collapsedFeatureNames: []
                    })))
                : state;

        case getType(actions.ui.featureDiagram.feature.collapseBelow):
        case getType(actions.ui.featureDiagram.feature.expandBelow):
            setOperation = isActionOf(actions.ui.featureDiagram.feature.collapseBelow, action) ? setAdd : setRemove;
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, state.currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        collapsedFeatureNames: setOperation(
                            (<FeatureDiagramCollaborativeSession>collaborativeSession).collapsedFeatureNames,
                            getFeatureNamesBelowWithActualChildren(state, state.currentArtifactPath!, action.payload.featureNames))
                    })))
                    : state;

        case getType(actions.ui.overlay.show):
            state = updateOverlay(state, action.payload.overlay, action.payload.overlayProps);
            if (action.payload.selectOneFeature)
                state = getNewState(state, 'collaborativeSessions',
                getNewCollaborativeSessions(state, state.currentArtifactPath!, (collaborativeSession: CollaborativeSession) =>
                    ({...collaborativeSession, selectedFeatureNames: [action.payload.selectOneFeature]})));
            return state;

        case getType(actions.ui.overlay.hide):
            return state.overlay === action.payload.overlay
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
        serverSendReducer,
        serverReceiveReducer,
        settingsReducer,
        uiReducer,
        initialState);