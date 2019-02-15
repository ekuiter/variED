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
import {Feature} from '../modeling/types';
import uuidv4 from 'uuid/v4';

export const SERVER_SEND_MESSAGE = 'server/sendMessage';
const SERVER_RECEIVE_MESSAGE = 'server/receiveMessage';

function createMessageAction<P>(fn: (payload: P) => Message): (payload: P) => ThunkAction<Promise<ReduxAction>, State, any, any> {
    return (payload: P) => {
        return async (dispatch: Dispatch<AnyAction>, getState: () => State) => {
            const message = fn(payload),
                state = getState(),
                artifactPath = state.currentArtifactPath;
            await sendMessage(message, artifactPath, state.settings.developer.delay);
            return dispatch(action(SERVER_SEND_MESSAGE, message));
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
        receive: createStandardAction(SERVER_RECEIVE_MESSAGE)<Message>(),
        joinRequest: createMessageAction(({artifactPath}: {artifactPath: ArtifactPath}) => ({type: MessageType.JOIN_REQUEST, artifactPath})),
        leaveRequest: createMessageAction(({artifactPath}: {artifactPath: ArtifactPath}) => ({type: MessageType.LEAVE_REQUEST, artifactPath})),
        undo: createMessageAction(() => ({type: MessageType.ERROR})), // TODO
        redo: createMessageAction(() => ({type: MessageType.ERROR})), // TODO
        featureDiagram: {
            feature: {
                // TODO: use kernel
                addBelow: createMessageAction(({belowfeatureID}: {belowfeatureID: string}) =>
                    ({type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_BELOW, belowfeatureID, newfeatureID: uuidv4()})),
                addAbove: createMessageAction(({abovefeatureIDs}: {abovefeatureIDs: string[]}) =>
                    ({type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_ABOVE, abovefeatureIDs, newfeatureID: uuidv4()})),
                remove: createMessageAction(({featureIDs}: {featureIDs: string[]}) =>
                    (featureIDs.map(featureID => ({type: MessageType.FEATURE_DIAGRAM_FEATURE_REMOVE, featureID})))),
                removeBelow: createMessageAction(({featureIDs}: {featureIDs: string[]}) =>
                    (featureIDs.map(featureID => ({type: MessageType.FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW, featureID})))),
                rename: createMessageAction(({featureID, name}: {featureID: string, name: string}) =>
                    ({type: MessageType.FEATURE_DIAGRAM_FEATURE_RENAME, featureID, name})),
                setDescription: createMessageAction(({featureID, description}: {featureID: string, description: string}) =>
                    ({type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION, featureID, description})),
                properties: {
                    setAbstract: createMessageAction(({featureIDs, value}: {featureIDs: string[], value: boolean}) =>
                        featureIDs.map(featureID => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureID, property: propertyTypes.abstract, value
                        }))),
                    setHidden: createMessageAction(({featureIDs, value}: {featureIDs: string[], value: boolean}) =>
                        featureIDs.map(featureID => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureID, property: propertyTypes.hidden, value
                        }))),
                    setOptional: createMessageAction(({featureIDs, value}: {featureIDs: string[], value: boolean}) =>
                        featureIDs.map(featureID => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureID, property: propertyTypes.optional, value
                        }))),
                    toggleOptional: createMessageAction(({feature}: {feature: Feature}) => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureID: feature.ID, property: propertyTypes.optional, value: !feature.isOptional
                        })),
                    setAnd: createMessageAction(({featureIDs}: {featureIDs: string[]}) =>
                        featureIDs.map(featureID => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureID, property: propertyTypes.group, value: groupValueTypes.and
                        }))),
                    setOr: createMessageAction(({featureIDs}: {featureIDs: string[]}) =>
                        featureIDs.map(featureID => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureID, property: propertyTypes.group, value: groupValueTypes.or
                        }))),
                    setAlternative: createMessageAction(({featureIDs}: {featureIDs: string[]}) =>
                        featureIDs.map(featureID => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureID, property: propertyTypes.group, value: groupValueTypes.alternative
                        }))),
                    toggleGroup: createMessageAction(({feature}: {feature: Feature}) => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureID: feature.ID, property: propertyTypes.group,
                            value: feature.isAnd
                                ? groupValueTypes.or : feature.isOr
                                    ? groupValueTypes.alternative : groupValueTypes.and
                        }))
                }
            }
        } 
    }
};

export default actions;
export type Action = ActionType<typeof actions>;