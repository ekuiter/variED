/**
 * Message actions define an interface to communicate with the server.
 */

import constants from '../constants';
import {MessageType, Feature, Message} from '../types';
import {createStandardAction} from 'typesafe-actions';

const {propertyTypes, groupValueTypes} = constants.server;

export const SERVER_SEND = 'server/send', SERVER_RECEIVE = 'server/receive';
export type ServerSendActionPayload = Message | Message[];
export interface ServerReceiveAction {
    type: 'server/receive',
    payload: Message
};

export default {
    undo: createStandardAction(SERVER_SEND).map(() => ({payload: {type: MessageType.UNDO}})),
    redo: createStandardAction(SERVER_SEND).map(() => ({payload: {type: MessageType.REDO}})),
    featureDiagram: {
        feature: {
            addBelow: createStandardAction(SERVER_SEND).map(({belowFeatureName}: {belowFeatureName: string}) =>
                ({payload: {type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_BELOW, belowFeature: belowFeatureName}})),
            addAbove: createStandardAction(SERVER_SEND).map(({aboveFeaturesNames}: {aboveFeaturesNames: string[]}) =>
                ({payload: {type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_ABOVE, aboveFeatures: aboveFeaturesNames}})),
            remove: createStandardAction(SERVER_SEND).map(({featureNames}: {featureNames: string[]}) =>
                ({payload: featureNames.map(featureName => ({type: MessageType.FEATURE_DIAGRAM_FEATURE_REMOVE, feature: featureName}))})),
            removeBelow: createStandardAction(SERVER_SEND).map(({featureNames}: {featureNames: string[]}) =>
                ({payload: featureNames.map(featureName => ({type: MessageType.FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW, feature: featureName}))})),
            rename: createStandardAction(SERVER_SEND).map(({oldFeatureName, newFeatureName}: {oldFeatureName: string, newFeatureName: string}) =>
                ({payload: {type: MessageType.FEATURE_DIAGRAM_FEATURE_RENAME, oldFeature: oldFeatureName, newFeature: newFeatureName}})),
            setDescription: createStandardAction(SERVER_SEND).map(({featureName, description}: {featureName: string, description: string}) =>
                ({payload: {type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION, feature: featureName, description}})),
            properties: {
                setAbstract: createStandardAction(SERVER_SEND).map(({featureNames, value}: {featureNames: string[], value: boolean}) => ({
                    payload: featureNames.map(featureName => ({
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.abstract, value
                    }))
                })),
                setHidden: createStandardAction(SERVER_SEND).map(({featureNames, value}: {featureNames: string[], value: boolean}) => ({
                    payload: featureNames.map(featureName => ({
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.hidden, value
                    }))
                })),
                setMandatory: createStandardAction(SERVER_SEND).map(({featureNames, value}: {featureNames: string[], value: boolean}) => ({
                    payload: featureNames.map(featureName => ({
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.mandatory, value
                    }))
                })),
                toggleMandatory: createStandardAction(SERVER_SEND).map(({feature}: {feature: Feature}) => ({
                    payload: {
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: feature.name, property: propertyTypes.mandatory, value: !feature.isMandatory
                    }
                })),
                setAnd: createStandardAction(SERVER_SEND).map(({featureNames}: {featureNames: string[]}) => ({
                    payload: featureNames.map(featureName => ({
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.group, value: groupValueTypes.and
                    }))
                })),
                setOr: createStandardAction(SERVER_SEND).map(({featureNames}: {featureNames: string[]}) => ({
                    payload: featureNames.map(featureName => ({
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.group, value: groupValueTypes.or
                    }))
                })),
                setAlternative: createStandardAction(SERVER_SEND).map(({featureNames}: {featureNames: string[]}) => ({
                    payload: featureNames.map(featureName => ({
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.group, value: groupValueTypes.alternative
                    }))
                })),
                toggleGroup: createStandardAction(SERVER_SEND).map(({feature}: {feature: Feature}) => ({
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
};