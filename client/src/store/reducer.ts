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
import actions, {Action, SERVER_SEND_MESSAGE, KERNEL_GENERATE_OPERATION} from './actions';
import {getType, isActionOf} from 'typesafe-actions';
import {State, initialState, CollaborativeSession, FeatureDiagramCollaborativeSession, initialFeatureDiagramCollaborativeSessionState, KernelContext} from './types';
import objectPath from 'object-path';
import objectPathImmutable from 'object-path-immutable';
import logger, {setLogLevel, LogLevel, defaultLogLevel} from '../helpers/logger';
import {AnyAction, Store} from 'redux';
import Kernel from '../modeling/Kernel';
import {KernelFeatureModel, isKernelConflictDescriptor} from '../modeling/types';
import {getCurrentArtifactPath, redirectToArtifactPath} from '../router';
import {enqueueMessage, flushMessageQueue} from '../server/messageQueue';
import deferred from '../helpers/deferred';

function getNewState(state: State, ...args: any[]): State {
    if (args.length % 2 === 1)
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
    const featureIDList = getCollaborativeSession(state, artifactPath)[key],
        actualFeatureIDs = getFeatureModel(state, artifactPath)!.getActualFeatureIDs(),
        obsoleteFeatureIDs = featureIDList.filter((featureID: string) => !actualFeatureIDs.includes(featureID));
    return obsoleteFeatureIDs.length > 0
        ? getNewState(state, 'collaborativeSessions',
            getNewCollaborativeSessions(state, artifactPath, (collaborativeSession: CollaborativeSession) =>
                ({...collaborativeSession, [key]: featureIDList.filter((featureID: string) => !obsoleteFeatureIDs.includes(featureID))})))
        : state;
}

function hideOverlayForObsoleteFeature(state: State): State {
    if (!isEditingFeatureModel(state))
        return state;
    const visibleFeatureIDs = getCurrentFeatureModel(state)!.getVisibleFeatureIDs();
    return state.overlay !== OverlayType.none && state.overlayProps.featureID &&
        !visibleFeatureIDs.includes(state.overlayProps.featureID)
        ? updateOverlay(state, OverlayType.none, {})
        : state;
}

function updateFeatureModel(state: State, artifactPath: ArtifactPath): State {
    state = removeObsoleteFeaturesFromFeatureList(state, artifactPath, 'collapsedFeatureIDs');
    // TODO: warn user that selection changed
    state = removeObsoleteFeaturesFromFeatureList(state, artifactPath, 'selectedFeatureIDs');
    // state: warn user that overlay was hidden
    state = hideOverlayForObsoleteFeature(state);
    return state;
}

function updateOverlay(state: State, overlay: OverlayType, overlayProps: OverlayProps): State {
    const collaborativeSession = getCurrentCollaborativeSession(state);
    if (isFeatureDiagramCollaborativeSession(collaborativeSession) &&
        !collaborativeSession.isSelectMultipleFeatures &&
        isFloatingFeatureOverlay(state.overlay) &&
        !isFloatingFeatureOverlay(overlay))
        return getNewState(state, 'overlay', overlay, 'overlayProps', overlayProps,
            'collaborativeSessions',
            getNewCollaborativeSessions(state,
                getCurrentArtifactPath(state.collaborativeSessions)!,
                (collaborativeSession: CollaborativeSession) =>
                    ({...collaborativeSession, selectedFeatureIDs: []})));
    else
        return getNewState(state, 'overlay', overlay, 'overlayProps', overlayProps);
}

function getFeatureIDsBelowWithActualChildren(state: State, artifactPath: ArtifactPath, featureIDs: string[]): string[] {
    return featureIDs.map(featureID =>
        getFeatureModel(state, artifactPath)!.getFeatureIDsBelowWithActualChildren(featureID))
        .reduce((acc, children) => acc.concat(children), []);
}

function fitToScreen(state: State, collaborativeSession: CollaborativeSession): string[] {
    return getFeatureModel(state, collaborativeSession.artifactPath)!.getFittingFeatureIDs(
        state.settings, (<FeatureDiagramCollaborativeSession>collaborativeSession).layout);
}

function kernelReducer(state: State, action: AnyAction): State {
    if (action.type === KERNEL_GENERATE_OPERATION) {
        const {kernelFeatureModel, kernelContext, artifactPath}:
            {kernelFeatureModel: KernelFeatureModel, kernelContext: KernelContext, artifactPath: ArtifactPath} = action.payload;
        state = getNewState(state, 'collaborativeSessions',
            getNewCollaborativeSessions(state, artifactPath,
                (collaborativeSession: CollaborativeSession) =>
                    ({...collaborativeSession, kernelContext, kernelCombinedEffect: kernelFeatureModel})));
        state = updateFeatureModel(state, artifactPath);
        return state;
    }
    return state;
}

function serverSendReducer(state: State, action: AnyAction): State {
    if (action.type === SERVER_SEND_MESSAGE) {
        const message: Message = action.payload;
        switch (message.type) {
            case MessageType.LEAVE_REQUEST:
                // TODO: we just assume that leaving succeeds here. It would be better to wait for the server's
                // acknowledgement (and use promises in actions.ts to dispatch this update), see issue #9.
                // Also right now, when the server kicks us from a session, we do not handle this.
                if (isArtifactPathEqual(getCurrentArtifactPath(state.collaborativeSessions), action.payload.artifactPath!))
                    redirectToArtifactPath();
                return getNewState(state,
                    'collaborativeSessions',
                        state.collaborativeSessions.filter(collaborativeSession =>
                            !isArtifactPathEqual(collaborativeSession.artifactPath, message.artifactPath)));

            default:
                return state;
        }
    }
    return state;
}

// Calls the kernel and sends messages, which makes this reducer _not pure_.
// Thus, time travel etc. is not supported.
function serverReceiveReducer(state: State, action: Action): State {
    if (isActionOf(actions.server.receive, action) && isMessageType(action.payload.type)) {
        switch (action.payload.type) {
            case MessageType.ERROR:
                logger.warnTagged({tag: 'server'}, () => action.payload.error);
                return state;

            case MessageType.COLLABORATOR_JOINED:
                if (action.payload.artifactPath)
                    return getNewState(state, 'collaborativeSessions',
                        getNewCollaborativeSessions(state, action.payload.artifactPath!,
                            (collaborativeSession: CollaborativeSession) => {
                                const collaborators = setAdd(collaborativeSession.collaborators,
                                    action.payload.collaborator, collaborator => collaborator.siteID);
                                return {...collaborativeSession, collaborators};
                            }));
                else
                    return getNewState(state, 'myself', action.payload.collaborator);

            case MessageType.COLLABORATOR_LEFT:
                return getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, action.payload.artifactPath!,
                        (collaborativeSession: CollaborativeSession) => {
                            const collaborators = setRemove(collaborativeSession.collaborators,
                                action.payload.collaborator, collaborator => collaborator.siteID);
                            return {...collaborativeSession, collaborators};
                        }));

            case MessageType.ADD_ARTIFACT:
                return getNewState(state, 'artifactPaths',
                    setAdd(state.artifactPaths, action.payload.artifactPaths,
                        artifactPath => artifactPath, isArtifactPathEqual));

            case MessageType.REMOVE_ARTIFACT:
                return getNewState(state, 'artifactPaths', setRemove(
                    state.artifactPaths, action.payload.artifactPath!,
                    artifactPath => artifactPath, isArtifactPathEqual));

            case MessageType.INITIALIZE:
                if (!state.myself)
                    throw new Error('no site ID assigned to self');
                const [kernelContext, kernelCombinedEffect] = 
                    Kernel.initialize(action.payload.artifactPath!, state.myself.siteID, action.payload.context);
                state = getNewState(state,
                    'collaborativeSessions', [...state.collaborativeSessions,
                        initialFeatureDiagramCollaborativeSessionState(
                            action.payload.artifactPath!, kernelContext, kernelCombinedEffect)]);
                if (isEditingFeatureModel(state)) {
                    state = getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, action.payload.artifactPath!,
                        (collaborativeSession: CollaborativeSession) => ({
                            ...collaborativeSession,
                            collapsedFeatureIDs: fitToScreen(state, getCollaborativeSession(state, action.payload.artifactPath!))
                        })));
                    state = updateFeatureModel(state, action.payload.artifactPath!);
                }
                return state;

            case MessageType.KERNEL:
                state = getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, action.payload.artifactPath!,
                        (collaborativeSession: CollaborativeSession) => {
                            let [kernelContext, kernelCombinedEffect] =
                                Kernel.run(state, collaborativeSession.artifactPath, kernel =>
                                    kernel.receiveMessage(action.payload.message));
                            if (!isKernelConflictDescriptor((<FeatureDiagramCollaborativeSession>collaborativeSession).kernelCombinedEffect) &&
                                isKernelConflictDescriptor(kernelCombinedEffect)) {
                                const artifactPath = collaborativeSession.artifactPath;
                                let heartbeat;
                                [kernelContext, heartbeat] = Kernel.run(state, artifactPath, kernel => kernel.generateHeartbeat());
                                enqueueMessage({type: MessageType.KERNEL, message: heartbeat}, artifactPath);
                                deferred(flushMessageQueue)();
                            }
                            return {...collaborativeSession, kernelContext, kernelCombinedEffect};  // TODO: do not change on heartbeats
                        }));
                if (isEditingFeatureModel(state))
                    state = updateFeatureModel(state, action.payload.artifactPath!);
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
            if (action.payload.path === 'developer.debug') {
                // just for once, we allow side-effects in a reducer: when the debug flag is set or cleared,
                // the log level is adjusted accordingly.
                const newDebug = typeof action.payload.value === 'function' ? action.payload.value(state.settings.developer.debug) : action.payload.value;
                setLogLevel(newDebug ? LogLevel.info : defaultLogLevel);
            }
            return getNewState(state, 'settings', getNewSettings(state.settings, action.payload.path, action.payload.value));

        case getType(actions.settings.reset):
            setLogLevel(defaultLogLevel);
            return getNewState(state, 'settings', defaultSettings);
    }
    return state;
}

function uiReducer(state: State, action: Action): State {
    let setOperation: SetOperationFunction<string>;
    const currentArtifactPath = getCurrentArtifactPath(state.collaborativeSessions);

    switch (action.type) {
        case getType(actions.ui.featureDiagram.setLayout):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, currentArtifactPath!, (collaborativeSession: CollaborativeSession) =>
                        ({...collaborativeSession, layout: action.payload.layout})))
                : state;

        case getType(actions.ui.featureDiagram.fitToScreen):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        collapsedFeatureIDs: fitToScreen(state, collaborativeSession)
                    })),
                    'settings', getNewSettings(state.settings, 'featureDiagram.forceRerender', +new Date()))
                : state;

        case getType(actions.ui.featureDiagram.feature.setSelectMultiple):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        isSelectMultipleFeatures: action.payload.isSelectMultipleFeatures,
                        selectedFeatureIDs: []
                    })))
                : state;

        case getType(actions.ui.featureDiagram.feature.select):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        selectedFeatureIDs: setAdd(
                            (<FeatureDiagramCollaborativeSession>collaborativeSession).selectedFeatureIDs,
                            action.payload.featureID)
                    })))
                : state;

        case getType(actions.ui.featureDiagram.feature.deselect):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, currentArtifactPath!, (collaborativeSession: CollaborativeSession) => {
                        const selectedFeatureIDs = setRemove(
                            (<FeatureDiagramCollaborativeSession>collaborativeSession).selectedFeatureIDs,
                            action.payload.featureID);
                        return selectedFeatureIDs.length > 0
                            ? {...collaborativeSession, selectedFeatureIDs}
                            : {...collaborativeSession, selectedFeatureIDs, isSelectMultipleFeatures: false};
                    }))
                : state;

        case getType(actions.ui.featureDiagram.feature.selectAll):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        selectedFeatureIDs: getCurrentFeatureModel(state)!.getVisibleFeatureIDs(),
                        isSelectMultipleFeatures: true
                    })))
                : state;

        case getType(actions.ui.featureDiagram.feature.deselectAll):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        selectedFeatureIDs: [],
                        isSelectMultipleFeatures: false
                    })))
                : state;

        case getType(actions.ui.featureDiagram.feature.collapse):
        case getType(actions.ui.featureDiagram.feature.expand):
            setOperation = isActionOf(actions.ui.featureDiagram.feature.collapse, action) ? setAdd : setRemove;
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        collapsedFeatureIDs: setOperation(
                            (<FeatureDiagramCollaborativeSession>collaborativeSession).collapsedFeatureIDs,
                            action.payload.featureIDs)
                    })))
                    : state;

        case getType(actions.ui.featureDiagram.feature.collapseAll):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        collapsedFeatureIDs: getCurrentFeatureModel(state)!.getFeatureIDsWithActualChildren()
                    })))
                : state;

        case getType(actions.ui.featureDiagram.feature.expandAll):
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        collapsedFeatureIDs: []
                    })))
                : state;

        case getType(actions.ui.featureDiagram.feature.collapseBelow):
        case getType(actions.ui.featureDiagram.feature.expandBelow):
            setOperation = isActionOf(actions.ui.featureDiagram.feature.collapseBelow, action) ? setAdd : setRemove;
            return isEditingFeatureModel(state)
                ? getNewState(state, 'collaborativeSessions',
                    getNewCollaborativeSessions(state, currentArtifactPath!, (collaborativeSession: CollaborativeSession) => ({
                        ...collaborativeSession,
                        collapsedFeatureIDs: setOperation(
                            (<FeatureDiagramCollaborativeSession>collaborativeSession).collapsedFeatureIDs,
                            getFeatureIDsBelowWithActualChildren(state, currentArtifactPath!, action.payload.featureIDs))
                    })))
                    : state;

        case getType(actions.ui.overlay.show):
            state = updateOverlay(state, action.payload.overlay, action.payload.overlayProps);
            if (action.payload.selectOneFeature)
                state = getNewState(state, 'collaborativeSessions',
                getNewCollaborativeSessions(state, currentArtifactPath!, (collaborativeSession: CollaborativeSession) =>
                    ({...collaborativeSession, selectedFeatureIDs: [action.payload.selectOneFeature]})));
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
        kernelReducer,
        serverSendReducer,
        serverReceiveReducer,
        settingsReducer,
        uiReducer,
        initialState);
export type Store = Store<State, Action>;