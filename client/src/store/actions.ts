/**
 * Actions define an interface to update the Redux store.
 * They are plain objects describing a state change.
 */

import {createStandardAction, ActionType, action} from 'typesafe-actions';
import constants from '../constants';
import {Message, MessageType, FeatureDiagramLayoutType, OverlayType, OverlayProps, ArtifactPath} from '../types';
import {Dispatch, AnyAction, Action as ReduxAction} from 'redux';
import {sendMessage, sendBatchMessage} from '../server/webSocket';
import {ThunkAction} from 'redux-thunk';
import {State} from './types';
import {Feature} from '../modeling/types';
import uuidv4 from 'uuid/v4';

const {propertyTypes, groupValueTypes} = constants.server;

export const SERVER_SEND_MESSAGE = 'server/sendMessage';
const SERVER_RECEIVE_MESSAGE = 'server/receiveMessage';

function createMessageAction<P>(fn: (payload: P) => Message | Message[]): (payload: P) => ThunkAction<Promise<ReduxAction>, State, any, any> {
    return (payload: P) => {
        return async (dispatch: Dispatch<AnyAction>, getState: () => State) => {
            const messageOrMessages = fn(payload),
                state = getState(),
                artifactPath = state.currentArtifactPath;
            if (Array.isArray(messageOrMessages))
                await sendBatchMessage(messageOrMessages, artifactPath, state.settings.developer.delay);
            else
                await sendMessage(messageOrMessages, artifactPath, state.settings.developer.delay);
            return dispatch(action(SERVER_SEND_MESSAGE, messageOrMessages));
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
                select: createStandardAction('ui/featureDiagram/feature/select')<{featureUUID: string}>(),
                deselect: createStandardAction('ui/featureDiagram/feature/deselect')<{featureUUID: string}>(),
                selectAll: createStandardAction('ui/featureDiagram/feature/selectAll')<void>(),
                deselectAll: createStandardAction('ui/featureDiagram/feature/deselectAll')<void>(),
                collapse: createStandardAction('ui/featureDiagram/feature/collapse')<{featureUUIDs: string[]}>(),
                expand: createStandardAction('ui/featureDiagram/feature/expand')<{featureUUIDs: string[]}>(),
                collapseAll: createStandardAction('ui/featureDiagram/feature/collapseAll')<void>(),
                expandAll: createStandardAction('ui/featureDiagram/feature/expandAll')<void>(),
                collapseBelow: createStandardAction('ui/featureDiagram/feature/collapseBelow')<{featureUUIDs: string[]}>(),
                expandBelow: createStandardAction('ui/featureDiagram/feature/expandBelow')<{featureUUIDs: string[]}>()
            }
        },
        overlay: {
            show: createStandardAction('ui/overlay/show')<{overlay: OverlayType, overlayProps: OverlayProps, selectOneFeature?: string}>(),
            hide: createStandardAction('ui/overlay/hide')<{overlay: OverlayType}>()
        }
    },
    server: {
        receive: createStandardAction(SERVER_RECEIVE_MESSAGE)<Message>(),
        join: createMessageAction(({artifactPath}: {artifactPath: ArtifactPath}) => ({type: MessageType.JOIN, artifactPath})),
        leave: createMessageAction(({artifactPath}: {artifactPath: ArtifactPath}) => ({type: MessageType.LEAVE, artifactPath})),
        undo: createMessageAction(() => ({type: MessageType.UNDO})),
        redo: createMessageAction(() => ({type: MessageType.REDO})),
        featureDiagram: {
            feature: {
                addBelow: createMessageAction(({belowFeatureUUID}: {belowFeatureUUID: string}) =>
                    ({type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_BELOW, belowFeatureUUID, newFeatureUUID: uuidv4()})),
                addAbove: createMessageAction(({aboveFeatureUUIDs}: {aboveFeatureUUIDs: string[]}) =>
                    ({type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_ABOVE, aboveFeatureUUIDs, newFeatureUUID: uuidv4()})),
                remove: createMessageAction(({featureUUIDs}: {featureUUIDs: string[]}) =>
                    (featureUUIDs.map(featureUUID => ({type: MessageType.FEATURE_DIAGRAM_FEATURE_REMOVE, featureUUID})))),
                removeBelow: createMessageAction(({featureUUIDs}: {featureUUIDs: string[]}) =>
                    (featureUUIDs.map(featureUUID => ({type: MessageType.FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW, featureUUID})))),
                rename: createMessageAction(({featureUUID, name}: {featureUUID: string, name: string}) =>
                    ({type: MessageType.FEATURE_DIAGRAM_FEATURE_RENAME, featureUUID, name})),
                setDescription: createMessageAction(({featureUUID, description}: {featureUUID: string, description: string}) =>
                    ({type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION, featureUUID, description})),
                properties: {
                    setAbstract: createMessageAction(({featureUUIDs, value}: {featureUUIDs: string[], value: boolean}) =>
                        featureUUIDs.map(featureUUID => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureUUID, property: propertyTypes.abstract, value
                        }))),
                    setHidden: createMessageAction(({featureUUIDs, value}: {featureUUIDs: string[], value: boolean}) =>
                        featureUUIDs.map(featureUUID => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureUUID, property: propertyTypes.hidden, value
                        }))),
                    setMandatory: createMessageAction(({featureUUIDs, value}: {featureUUIDs: string[], value: boolean}) =>
                        featureUUIDs.map(featureUUID => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureUUID, property: propertyTypes.mandatory, value
                        }))),
                    toggleMandatory: createMessageAction(({feature}: {feature: Feature}) => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureUUID: feature.uuid, property: propertyTypes.mandatory, value: !feature.isMandatory
                        })),
                    setAnd: createMessageAction(({featureUUIDs}: {featureUUIDs: string[]}) =>
                        featureUUIDs.map(featureUUID => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureUUID, property: propertyTypes.group, value: groupValueTypes.and
                        }))),
                    setOr: createMessageAction(({featureUUIDs}: {featureUUIDs: string[]}) =>
                        featureUUIDs.map(featureUUID => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureUUID, property: propertyTypes.group, value: groupValueTypes.or
                        }))),
                    setAlternative: createMessageAction(({featureUUIDs}: {featureUUIDs: string[]}) =>
                        featureUUIDs.map(featureUUID => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureUUID, property: propertyTypes.group, value: groupValueTypes.alternative
                        }))),
                    toggleGroup: createMessageAction(({feature}: {feature: Feature}) => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureUUID: feature.uuid, property: propertyTypes.group,
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