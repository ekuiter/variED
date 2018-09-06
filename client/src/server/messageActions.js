import {sendMessage} from './webSocket';
import constants from '../constants';

const {messageTypes, propertyTypes, groupValueTypes} = constants.server;

function sendMultipleMessages(messages) {
    if (!messages || messages.length === 0)
        return Promise.resolve();
    if (messages.length === 1)
        return sendMessage(messages[0]);
    return sendMessage({type: messageTypes.MULTIPLE_MESSAGES, messages});
}

export default {
    undo: () => sendMessage({type: messageTypes.UNDO}),
    redo: () => sendMessage({type: messageTypes.REDO}),
    featureDiagram: {
        feature: {
            addBelow: belowFeatureName =>
                sendMessage({type: messageTypes.FEATURE_DIAGRAM_FEATURE_ADD_BELOW, belowFeature: belowFeatureName}),
            addAbove: aboveFeaturesNames =>
                sendMessage({type: messageTypes.FEATURE_DIAGRAM_FEATURE_ADD_ABOVE, aboveFeatures: aboveFeaturesNames}),
            remove: (...featureNames) =>
                sendMultipleMessages(featureNames.map(featureName => ({type: messageTypes.FEATURE_DIAGRAM_FEATURE_REMOVE, feature: featureName}))),
            removeBelow: (...featureNames) =>
                sendMultipleMessages(featureNames.map(featureName => ({type: messageTypes.FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW, feature: featureName}))),
            rename: (oldFeatureName, newFeatureName) =>
                sendMessage({type: messageTypes.FEATURE_DIAGRAM_FEATURE_RENAME, oldFeature: oldFeatureName, newFeature: newFeatureName}),
            setDescription: (featureName, description) =>
                sendMessage({type: messageTypes.FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION, feature: featureName, description}),
            properties: {
                setAbstract: (featureName, value) =>
                    sendMessage({
                        type: messageTypes.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.abstract, value
                    }),
                setHidden: (featureName, value) =>
                    sendMessage({
                        type: messageTypes.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.hidden, value
                    }),
                setMandatory: (featureName, value) =>
                    sendMessage({
                        type: messageTypes.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.mandatory, value
                    }),
                toggleMandatory: feature =>
                    sendMessage({
                        type: messageTypes.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: feature.name, property: propertyTypes.mandatory, value: !feature.isMandatory
                    }),
                setAnd: featureName =>
                    sendMessage({
                        type: messageTypes.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.group, value: groupValueTypes.and
                    }),
                setOr: featureName =>
                    sendMessage({
                        type: messageTypes.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.group, value: groupValueTypes.or
                    }),
                setAlternative: featureName =>
                    sendMessage({
                        type: messageTypes.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: featureName, property: propertyTypes.group, value: groupValueTypes.alternative
                    }),
                toggleGroup: feature =>
                    sendMessage({
                        type: messageTypes.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: feature.name, property: propertyTypes.group,
                        value: feature.isAnd
                            ? groupValueTypes.or : feature.isOr
                                ? groupValueTypes.alternative : groupValueTypes.and
                    })
            }
        }
    } 
};