/**
 * Actions define an interface to update the Redux store.
 * They are plain objects describing a state change.
 */

import {createStandardAction, ActionType, action} from 'typesafe-actions';
import {Message, MessageType, FeatureDiagramLayoutType, OverlayType, OverlayProps, ArtifactPath} from '../types';
import {Dispatch, AnyAction, Action as ReduxAction} from 'redux';
import {sendMessage} from '../server/webSocket';
import {ThunkAction} from 'redux-thunk';
import {State} from './types';
import {Feature, PropertyType, GroupType} from '../modeling/types';
import Kernel from '../modeling/Kernel';

export const SERVER_SEND_MESSAGE = 'server/sendMessage';
export const KERNEL_FEATURE_MODEL = 'kernel/featureModel';

function createMessageAction<P>(fn: (payload: P) => Message): (payload: P) => ThunkAction<Promise<ReduxAction>, State, any, any> {
    return (payload: P) => {
        return async (dispatch: Dispatch<AnyAction>, getState: () => State) => {
            const state = getState(),
                artifactPath = state.currentArtifactPath,
                message = await sendMessage(fn(payload), artifactPath, state.settings.developer.delay);
            return dispatch(action(SERVER_SEND_MESSAGE, message));
        };
    };
}

function createOperationAction<P>(makePOSequence: (payload: P, kernel: Kernel) => Message): (payload: P) => ThunkAction<Promise<ReduxAction>, State, any, any> {
    return (payload: P) => {
        return async (dispatch: Dispatch<AnyAction>, getState: () => State) => {
            const state = getState(),
                artifactPath = state.currentArtifactPath;
            const [kernelContext, [serializedFeatureModel, operation]] =
                Kernel.run(state, artifactPath, kernel =>
                    kernel.generateOperation(makePOSequence(payload, kernel)));
            const message: Message = {type: MessageType.KERNEL, message: operation};
            sendMessage(message, artifactPath, state.settings.developer.delay); // TODO: message queue
            return dispatch(action(KERNEL_FEATURE_MODEL, {serializedFeatureModel, kernelContext}));
            };
    };
}

const actions = {
    settings: {
        set: createStandardAction('settings/set')<{path: string, value: any}>(),
        reset: createStandardAction('settings/reset')<void>()
    },
    ui: {
        setCurrentArtifactPath: createStandardAction('ui/setCurrentArtifactPath')<{artifactPath?: ArtifactPath}>(),
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
        joinRequest: createMessageAction(({artifactPath}: {artifactPath: ArtifactPath}) => ({type: MessageType.JOIN_REQUEST, artifactPath})),
        leaveRequest: createMessageAction(({artifactPath}: {artifactPath: ArtifactPath}) => ({type: MessageType.LEAVE_REQUEST, artifactPath})),
        undo: createMessageAction(() => ({type: MessageType.ERROR})), // TODO
        redo: createMessageAction(() => ({type: MessageType.ERROR})), // TODO
        featureDiagram: {
            feature: {
                createBelow: createOperationAction(({featureParentID}: {featureParentID: string}, kernel) =>
                    kernel!.operationCreateFeatureBelow(featureParentID)),
                
                createAbove: createOperationAction(({featureIDs}: {featureIDs: string[]}, kernel) =>
                    kernel.operationCreateFeatureAbove(...featureIDs)),
                
                remove: createOperationAction(({featureIDs}: {featureIDs: string[]}, kernel) =>
                // TODO: batch operation (ensure preconditions: consider the root feature!)
                    featureIDs.length === 1 ? kernel.operationRemoveFeature(featureIDs[0]) : (window as any).alert('not currently supported')),
                
                removeSubtree: createOperationAction(({featureIDs}: {featureIDs: string[]}, kernel) =>
                // TODO: batch operation (ensure preconditions: consider subfeatures!)
                    featureIDs.length === 1 ? kernel.operationRemoveFeatureSubtree(featureIDs[0]) : (window as any).alert('not currently supported')),
                
                setName: createOperationAction(({featureID, name}: {featureID: string, name: string}, kernel) =>
                    kernel.operationSetFeatureProperty(featureID, PropertyType.name, name)),

                setDescription: createOperationAction(({featureID, description}: {featureID: string, description: string}, kernel) =>
                    kernel.operationSetFeatureProperty(featureID, PropertyType.description, description)),

                properties: {
                    // TODO: might need to check preconditions (such as root mandatory)
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
            }
        } 
    }
};

export default actions;
export type Action = ActionType<typeof actions>;