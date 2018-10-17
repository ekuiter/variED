/**
 * Message actions define an interface to communicate with the server.
 */

import {sendMessage} from './webSocket';
import constants from '../constants';
import {MessageType} from '../types';

const {propertyTypes, groupValueTypes} = constants.server;

function sendMultipleMessages(messages) {
    if (!messages || messages.length === 0)
        return Promise.resolve();
    if (messages.length === 1)
        return sendMessage(messages[0]);
    return sendMessage({type: MessageType.MULTIPLE_MESSAGES, messages});
}

export default {
    undo: () => sendMessage({type: MessageType.UNDO}),
    redo: () => sendMessage({type: MessageType.REDO}),
    featureDiagram: {
        feature: {
            addBelow: belowFeatureName =>
                sendMessage({type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_BELOW, belowFeature: belowFeatureName}),
            addAbove: aboveFeaturesNames =>
                sendMessage({type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_ABOVE, aboveFeatures: aboveFeaturesNames}),
            remove: featureNames =>
                sendMultipleMessages(featureNames.map(featureName => ({type: MessageType.FEATURE_DIAGRAM_FEATURE_REMOVE, feature: featureName}))),
            removeBelow: featureNames =>
                sendMultipleMessages(featureNames.map(featureName => ({type: MessageType.FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW, feature: featureName}))),
            rename: (oldFeatureName, newFeatureName) =>
                sendMessage({type: MessageType.FEATURE_DIAGRAM_FEATURE_RENAME, oldFeature: oldFeatureName, newFeature: newFeatureName}),
            setDescription: (featureName, description) =>
                sendMessage({type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION, feature: featureName, description}),
            properties: {
                setAbstract: (featureNames, value) =>
                    sendMultipleMessages(featureNames.map(featureName => ({
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.abstract, value
                    }))),
                setHidden: (featureNames, value) =>
                    sendMultipleMessages(featureNames.map(featureName => ({
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.hidden, value
                    }))),
                setMandatory: (featureNames, value) =>
                    sendMultipleMessages(featureNames.map(featureName => ({
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.mandatory, value
                    }))),
                toggleMandatory: feature =>
                    sendMessage({
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: feature.name, property: propertyTypes.mandatory, value: !feature.isMandatory
                    }),
                setAnd: featureNames =>
                    sendMultipleMessages(featureNames.map(featureName => ({
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.group, value: groupValueTypes.and
                    }))),
                setOr: featureNames =>
                    sendMultipleMessages(featureNames.map(featureName => ({
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.group, value: groupValueTypes.or
                    }))),
                setAlternative: featureNames =>
                    sendMultipleMessages(featureNames.map(featureName => ({
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.group, value: groupValueTypes.alternative
                    }))),
                toggleGroup: feature =>
                    sendMessage({
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: feature.name, property: propertyTypes.group,
                        value: feature.isAnd
                            ? groupValueTypes.or : feature.isOr
                                ? groupValueTypes.alternative : groupValueTypes.and
                    })
            }
        }
    } 
};