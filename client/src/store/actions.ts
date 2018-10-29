/**
 * Actions define an interface to update the Redux store.
 * They are plain objects describing a state change.
 */

import {createStandardAction, ActionType, action} from 'typesafe-actions';
import constants from '../constants';
import {Message, MessageType, Feature, FeatureDiagramLayoutType, OverlayType, OverlayProps, ArtifactPath} from '../types';
import {Dispatch, AnyAction, Action as ReduxAction} from 'redux';
import {sendMessage, sendBatchMessage} from '../server/webSocket';
import {ThunkAction} from 'redux-thunk';
import {State} from './types';

const {propertyTypes, groupValueTypes} = constants.server;

export const SERVER_SEND_MESSAGE = 'server/sendMessage';
const SERVER_RECEIVE_MESSAGE = 'server/receiveMessage';

function createServerAction<P>(fn: (payload: P) => Message | Message[]): (payload: P) => ThunkAction<Promise<ReduxAction>, State, any, any> {
    return (payload: P) => {
        return async (dispatch: Dispatch<AnyAction>, getState: () => State) => {
            const messageOrMessages = fn(payload),
                artifactPath = getState().currentArtifactPath;
            if (Array.isArray(messageOrMessages))
                await sendBatchMessage(messageOrMessages.map(message =>
                    artifactPath || message.artifactPath ? {artifactPath, ...message} : message));
            else
                await sendMessage(artifactPath || messageOrMessages.artifactPath
                    ? {artifactPath, ...messageOrMessages}
                    : messageOrMessages);
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
        featureDiagram: {
            setLayout: createStandardAction('ui/featureDiagram/setLayout')<{layout: FeatureDiagramLayoutType}>(),
            fitToScreen: createStandardAction('ui/featureDiagram/fitToScreen')<void>(),
            feature: {
                setSelectMultiple: createStandardAction('ui/featureDiagram/feature/setSelectMultiple')<{isSelectMultipleFeatures: boolean}>(),
                select: createStandardAction('ui/featureDiagram/feature/select')<{featureName: string}>(),
                deselect: createStandardAction('ui/featureDiagram/feature/deselect')<{featureName: string}>(),
                selectAll: createStandardAction('ui/featureDiagram/feature/selectAll')<void>(),
                deselectAll: createStandardAction('ui/featureDiagram/feature/deselectAll')<void>(),
                collapse: createStandardAction('ui/featureDiagram/feature/collapse')<{featureNames: string[]}>(),
                expand: createStandardAction('ui/featureDiagram/feature/expand')<{featureNames: string[]}>(),
                collapseAll: createStandardAction('ui/featureDiagram/feature/collapseAll')<void>(),
                expandAll: createStandardAction('ui/featureDiagram/feature/expandAll')<void>(),
                collapseBelow: createStandardAction('ui/featureDiagram/feature/collapseBelow')<{featureNames: string[]}>(),
                expandBelow: createStandardAction('ui/featureDiagram/feature/expandBelow')<{featureNames: string[]}>()
            }
        },
        overlay: {
            show: createStandardAction('ui/overlay/show')<{overlay: OverlayType, overlayProps: OverlayProps, selectOneFeature?: string}>(),
            hide: createStandardAction('ui/overlay/hide')<{overlay: OverlayType}>()
        }
    },
    server: {
        receive: createStandardAction(SERVER_RECEIVE_MESSAGE)<Message>(),
        join: createServerAction(({artifactPath}: {artifactPath: ArtifactPath}) => ({type: MessageType.JOIN, artifactPath})),
        leave: createServerAction(({artifactPath}: {artifactPath: ArtifactPath}) => ({type: MessageType.LEAVE, artifactPath})),
        undo: createServerAction(() => ({type: MessageType.UNDO})),
        redo: createServerAction(() => ({type: MessageType.REDO})),
        featureDiagram: {
            feature: {
                addBelow: createServerAction(({belowFeatureName}: {belowFeatureName: string}) =>
                    ({type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_BELOW, belowFeature: belowFeatureName})),
                addAbove: createServerAction(({aboveFeatureNames}: {aboveFeatureNames: string[]}) =>
                    ({type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_ABOVE, aboveFeatures: aboveFeatureNames})),
                remove: createServerAction(({featureNames}: {featureNames: string[]}) =>
                    (featureNames.map(featureName => ({type: MessageType.FEATURE_DIAGRAM_FEATURE_REMOVE, feature: featureName})))),
                removeBelow: createServerAction(({featureNames}: {featureNames: string[]}) =>
                    (featureNames.map(featureName => ({type: MessageType.FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW, feature: featureName})))),
                rename: createServerAction(({oldFeatureName, newFeatureName}: {oldFeatureName: string, newFeatureName: string}) =>
                    ({type: MessageType.FEATURE_DIAGRAM_FEATURE_RENAME, oldFeature: oldFeatureName, newFeature: newFeatureName})),
                setDescription: createServerAction(({featureName, description}: {featureName: string, description: string}) =>
                    ({type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION, feature: featureName, description})),
                properties: {
                    setAbstract: createServerAction(({featureNames, value}: {featureNames: string[], value: boolean}) =>
                        featureNames.map(featureName => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: featureName, property: propertyTypes.abstract, value
                        }))),
                    setHidden: createServerAction(({featureNames, value}: {featureNames: string[], value: boolean}) =>
                        featureNames.map(featureName => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: featureName, property: propertyTypes.hidden, value
                        }))),
                    setMandatory: createServerAction(({featureNames, value}: {featureNames: string[], value: boolean}) =>
                        featureNames.map(featureName => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: featureName, property: propertyTypes.mandatory, value
                        }))),
                    toggleMandatory: createServerAction(({feature}: {feature: Feature}) => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: feature.name, property: propertyTypes.mandatory, value: !feature.isMandatory
                        })),
                    setAnd: createServerAction(({featureNames}: {featureNames: string[]}) =>
                        featureNames.map(featureName => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: featureName, property: propertyTypes.group, value: groupValueTypes.and
                        }))),
                    setOr: createServerAction(({featureNames}: {featureNames: string[]}) =>
                        featureNames.map(featureName => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: featureName, property: propertyTypes.group, value: groupValueTypes.or
                        }))),
                    setAlternative: createServerAction(({featureNames}: {featureNames: string[]}) =>
                        featureNames.map(featureName => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: featureName, property: propertyTypes.group, value: groupValueTypes.alternative
                        }))),
                    toggleGroup: createServerAction(({feature}: {feature: Feature}) => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: feature.name, property: propertyTypes.group,
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