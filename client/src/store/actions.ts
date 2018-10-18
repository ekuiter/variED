/**
 * Actions define an interface to update the Redux store.
 * They are plain objects describing a state change.
 */

import {createStandardAction, ActionType} from 'typesafe-actions';
import constants from '../constants';
import {Message, MessageType, Feature} from '../types';

const {propertyTypes, groupValueTypes} = constants.server;

export const SERVER_SEND_MESSAGE = 'server/sendMessage';
const SERVER_RECEIVE_MESSAGE = 'server/receiveMessage';

const actions = {
    settings: {
        set: createStandardAction('settings/set')<{path: string, value: any}>(),
        reset: createStandardAction('settings/reset')<void>()
    },
    ui: {
        featureDiagram: {
            setLayout: createStandardAction('ui/featureDiagram/setLayout')<{layout: string}>(), // TODO
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
            // TODO: more accurate types
            show: createStandardAction('ui/overlay/show')<{overlay: string, overlayProps?: object, selectOneFeature?: string}>(),
            hide: createStandardAction('ui/overlay/hide')<{overlay: string}>()
        }
    },
    server: {
        receive: createStandardAction(SERVER_RECEIVE_MESSAGE)<Message>(),
        undo: createStandardAction(SERVER_SEND_MESSAGE).map(() => ({payload: {type: MessageType.UNDO}})),
        redo: createStandardAction(SERVER_SEND_MESSAGE).map(() => ({payload: {type: MessageType.REDO}})),
        featureDiagram: {
            feature: {
                addBelow: createStandardAction(SERVER_SEND_MESSAGE).map(({belowFeatureName}: {belowFeatureName: string}) =>
                    ({payload: {type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_BELOW, belowFeature: belowFeatureName}})),
                addAbove: createStandardAction(SERVER_SEND_MESSAGE).map(({aboveFeaturesNames}: {aboveFeaturesNames: string[]}) =>
                    ({payload: {type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_ABOVE, aboveFeatures: aboveFeaturesNames}})),
                remove: createStandardAction(SERVER_SEND_MESSAGE).map(({featureNames}: {featureNames: string[]}) =>
                    ({payload: featureNames.map(featureName => ({type: MessageType.FEATURE_DIAGRAM_FEATURE_REMOVE, feature: featureName}))})),
                removeBelow: createStandardAction(SERVER_SEND_MESSAGE).map(({featureNames}: {featureNames: string[]}) =>
                    ({payload: featureNames.map(featureName => ({type: MessageType.FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW, feature: featureName}))})),
                rename: createStandardAction(SERVER_SEND_MESSAGE).map(({oldFeatureName, newFeatureName}: {oldFeatureName: string, newFeatureName: string}) =>
                    ({payload: {type: MessageType.FEATURE_DIAGRAM_FEATURE_RENAME, oldFeature: oldFeatureName, newFeature: newFeatureName}})),
                setDescription: createStandardAction(SERVER_SEND_MESSAGE).map(({featureName, description}: {featureName: string, description: string}) =>
                    ({payload: {type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION, feature: featureName, description}})),
                properties: {
                    setAbstract: createStandardAction(SERVER_SEND_MESSAGE).map(({featureNames, value}: {featureNames: string[], value: boolean}) => ({
                        payload: featureNames.map(featureName => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: featureName, property: propertyTypes.abstract, value
                        }))
                    })),
                    setHidden: createStandardAction(SERVER_SEND_MESSAGE).map(({featureNames, value}: {featureNames: string[], value: boolean}) => ({
                        payload: featureNames.map(featureName => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: featureName, property: propertyTypes.hidden, value
                        }))
                    })),
                    setMandatory: createStandardAction(SERVER_SEND_MESSAGE).map(({featureNames, value}: {featureNames: string[], value: boolean}) => ({
                        payload: featureNames.map(featureName => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: featureName, property: propertyTypes.mandatory, value
                        }))
                    })),
                    toggleMandatory: createStandardAction(SERVER_SEND_MESSAGE).map(({feature}: {feature: Feature}) => ({
                        payload: {
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: feature.name, property: propertyTypes.mandatory, value: !feature.isMandatory
                        }
                    })),
                    setAnd: createStandardAction(SERVER_SEND_MESSAGE).map(({featureNames}: {featureNames: string[]}) => ({
                        payload: featureNames.map(featureName => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: featureName, property: propertyTypes.group, value: groupValueTypes.and
                        }))
                    })),
                    setOr: createStandardAction(SERVER_SEND_MESSAGE).map(({featureNames}: {featureNames: string[]}) => ({
                        payload: featureNames.map(featureName => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: featureName, property: propertyTypes.group, value: groupValueTypes.or
                        }))
                    })),
                    setAlternative: createStandardAction(SERVER_SEND_MESSAGE).map(({featureNames}: {featureNames: string[]}) => ({
                        payload: featureNames.map(featureName => ({
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: featureName, property: propertyTypes.group, value: groupValueTypes.alternative
                        }))
                    })),
                    toggleGroup: createStandardAction(SERVER_SEND_MESSAGE).map(({feature}: {feature: Feature}) => ({
                        payload: {
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: feature.name, property: propertyTypes.group,
                            value: feature.isAnd
                                ? groupValueTypes.or : feature.isOr
                                    ? groupValueTypes.alternative : groupValueTypes.and
                        }
                    }))
                }
            }
        } 
    }
};

export default actions;
export type Action = ActionType<typeof actions>;