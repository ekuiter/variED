/**
 * Actions define an interface to update the Redux store.
 * They are plain objects describing a state change.
 */

import {createStandardAction, ActionType, action} from 'typesafe-actions';
import {Message, MessageType, FeatureDiagramLayoutType, OverlayType, OverlayProps, ArtifactPath} from '../types';
import {Dispatch, AnyAction, Action as ReduxAction} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {State} from './types';
import {Feature, PropertyType, GroupType, KernelConstraintFormula} from '../modeling/types';
import Kernel from '../modeling/Kernel';
import {enqueueMessage, flushMessageQueue} from '../server/messageQueue';
import deferred from '../helpers/deferred';
import {getCurrentArtifactPath} from '../router';

export const SERVER_SEND_MESSAGE = 'server/sendMessage';
export const KERNEL_GENERATE_OPERATION = 'kernel/generateOperation';

function createMessageAction<P>(fn: (payload: P) => Message): (payload: P) => ThunkAction<Promise<ReduxAction>, State, any, any> {
    return (payload: P) => {
        return async (dispatch: Dispatch<AnyAction>, getState: () => State) => {
            const state = getState(),
                artifactPath = getCurrentArtifactPath(state.collaborativeSessions),
                message = enqueueMessage(fn(payload), artifactPath);
            deferred(flushMessageQueue)();
            return dispatch(action(SERVER_SEND_MESSAGE, message));
        };
    };
}

function createOperationAction<P>(makePOSequence: (payload: P, kernel: Kernel) => Message): (payload: P) => ThunkAction<Promise<ReduxAction>, State, any, any> {
    return (payload: P) => {
        return async (dispatch: Dispatch<AnyAction>, getState: () => State) => {
            const state = getState(),
                artifactPath = getCurrentArtifactPath(state.collaborativeSessions);
            const [kernelContext, [kernelFeatureModel, operation]] =
                Kernel.run(state, artifactPath, kernel =>
                    kernel.generateOperation(makePOSequence(payload, kernel)));
            const message: Message = {type: MessageType.KERNEL, message: operation};
            enqueueMessage(message, artifactPath);
            deferred(flushMessageQueue)();
            return dispatch(action(KERNEL_GENERATE_OPERATION, {artifactPath, kernelFeatureModel, kernelContext}));
        };
    };
}

const actions = {
    settings: {
        set: createStandardAction('settings/set')<{path: string, value: any}>(),
        reset: createStandardAction('settings/reset')<void>()
    },
    ui: {
        featureDiagram: {
            setLayout: createStandardAction('ui/featureDiagram/setLayout')<{layout: FeatureDiagramLayoutType}>(),
            fitToScreen: createStandardAction('ui/featureDiagram/fitToScreen')<void>(),
            feature: {
                setSelectMultiple: createStandardAction('ui/featureDiagram/feature/setSelectMultiple')<{isSelectMultipleFeatures: boolean}>(),
                select: createStandardAction('ui/featureDiagram/feature/select')<{featureID: string}>(),
                deselect: createStandardAction('ui/featureDiagram/feature/deselect')<{featureID: string}>(),
                selectAll: createStandardAction('ui/featureDiagram/feature/selectAll')<void>(),
                deselectAll: createStandardAction('ui/featureDiagram/feature/deselectAll')<void>(),
                collapse: createStandardAction('ui/featureDiagram/feature/collapse')<{featureIDs: string[]}>(),
                expand: createStandardAction('ui/featureDiagram/feature/expand')<{featureIDs: string[]}>(),
                collapseAll: createStandardAction('ui/featureDiagram/feature/collapseAll')<void>(),
                expandAll: createStandardAction('ui/featureDiagram/feature/expandAll')<void>(),
                collapseBelow: createStandardAction('ui/featureDiagram/feature/collapseBelow')<{featureIDs: string[]}>(),
                expandBelow: createStandardAction('ui/featureDiagram/feature/expandBelow')<{featureIDs: string[]}>()
            }
        },
        overlay: {
            show: createStandardAction('ui/overlay/show')<{overlay: OverlayType, overlayProps: OverlayProps, selectOneFeature?: string}>(),
            hide: createStandardAction('ui/overlay/hide')<{overlay: OverlayType}>()
        }
    },
    server: {
        receive: createStandardAction('server/receiveMessage')<Message>(),
        addArtifact: createMessageAction(({artifactPath, source}: {artifactPath: ArtifactPath, source?: string}) =>
            ({type: MessageType.ADD_ARTIFACT, artifactPath, source})),
        removeArtifact: createMessageAction(({artifactPath}: {artifactPath: ArtifactPath}) =>
            ({type: MessageType.REMOVE_ARTIFACT, artifactPath})),
        joinRequest: createMessageAction(({artifactPath}: {artifactPath: ArtifactPath}) => ({type: MessageType.JOIN_REQUEST, artifactPath})),
        leaveRequest: createMessageAction(({artifactPath}: {artifactPath: ArtifactPath}) => ({type: MessageType.LEAVE_REQUEST, artifactPath})),
        undo: createMessageAction(() => ({type: MessageType.ERROR})), // TODO
        redo: createMessageAction(() => ({type: MessageType.ERROR})), // TODO
        setUserProfile: createMessageAction(({name}: {name: string}) => ({type: MessageType.SET_USER_PROFILE, name})),
        reset: createMessageAction(() => ({type: MessageType.RESET})),
        featureDiagram: {
            feature: {
                createBelow: createOperationAction(({featureParentID}: {featureParentID: string}, kernel) =>
                    kernel!.operationCreateFeatureBelow(featureParentID)),
                
                createAbove: createOperationAction(({featureIDs}: {featureIDs: string[]}, kernel) =>
                    kernel.operationCreateFeatureAbove(...featureIDs)),
                
                remove: createOperationAction(({featureIDs}: {featureIDs: string[]}, kernel) =>
                    kernel.operationCompose(...featureIDs.map(featureID => kernel.operationRemoveFeature(featureID)))),
                
                removeSubtree: createOperationAction(({featureIDs}: {featureIDs: string[]}, kernel) =>
                    kernel.operationCompose(...featureIDs.map(featureID => kernel.operationRemoveFeatureSubtree(featureID)))),

                moveSubtree: createOperationAction(({featureID, featureParentID}: {featureID: string, featureParentID: string}, kernel) =>
                    kernel.operationMoveFeatureSubtree(featureID, featureParentID)),
                
                setName: createOperationAction(({featureID, name}: {featureID: string, name: string}, kernel) =>
                    kernel.operationSetFeatureProperty(featureID, PropertyType.name, name)),

                setDescription: createOperationAction(({featureID, description}: {featureID: string, description: string}, kernel) =>
                    kernel.operationSetFeatureProperty(featureID, PropertyType.description, description)),

                properties: {
                    setAbstract: createOperationAction(({featureIDs, value}: {featureIDs: string[], value: boolean}, kernel) =>
                        kernel.operationCompose(...featureIDs.map(featureID =>
                            kernel.operationSetFeatureProperty(featureID, PropertyType.abstract, value)))),

                    setHidden: createOperationAction(({featureIDs, value}: {featureIDs: string[], value: boolean}, kernel) =>
                        kernel.operationCompose(...featureIDs.map(featureID =>
                            kernel.operationSetFeatureProperty(featureID, PropertyType.hidden, value)))),

                    setOptional: createOperationAction(({featureIDs, value}: {featureIDs: string[], value: boolean}, kernel) =>
                        kernel.operationCompose(...featureIDs.map(featureID =>
                            kernel.operationSetFeatureOptional(featureID, value)))),

                    toggleOptional: createOperationAction(({feature}: {feature: Feature}, kernel) =>
                        kernel.operationSetFeatureOptional(feature.ID, !feature.isOptional)),
                        
                    setAnd: createOperationAction(({featureIDs}: {featureIDs: string[]}, kernel) =>
                        kernel.operationCompose(...featureIDs.map(featureID =>
                            kernel.operationSetFeatureGroupType(featureID, GroupType.and)))),

                    setOr: createOperationAction(({featureIDs}: {featureIDs: string[]}, kernel) =>
                        kernel.operationCompose(...featureIDs.map(featureID =>
                            kernel.operationSetFeatureGroupType(featureID, GroupType.or)))),

                    setAlternative: createOperationAction(({featureIDs}: {featureIDs: string[]}, kernel) =>
                        kernel.operationCompose(...featureIDs.map(featureID =>
                            kernel.operationSetFeatureGroupType(featureID, GroupType.alternative)))),
                    
                    toggleGroup: createOperationAction(({feature}: {feature: Feature}, kernel) =>
                        kernel.operationSetFeatureGroupType(feature.ID,
                            feature.isAnd
                            ? GroupType.or : feature.isOr
                                ? GroupType.alternative : GroupType.and))
                }
            },

            constraint: {
                create: createOperationAction(({formula}: {formula: KernelConstraintFormula}, kernel) =>
                    kernel.operationCreateConstraint(formula)),
                
                set: createOperationAction(({constraintID, formula}: {constraintID: string, formula: KernelConstraintFormula}, kernel) =>
                    kernel.operationSetConstraint(constraintID, formula)),

                remove: createOperationAction(({constraintID}: {constraintID: string}, kernel) =>
                    kernel.operationRemoveConstraint(constraintID)),
            },

            vote: createMessageAction(({versionID}: {versionID?: string}) => ({type: MessageType.VOTE, versionID})),
            setVotingStrategy: createMessageAction(({votingStrategy}: {votingStrategy: string}) =>
                ({type: MessageType.SET_VOTING_STRATEGY, votingStrategy}))
        }
    }
};

export default actions;
export type Action = ActionType<typeof actions>;