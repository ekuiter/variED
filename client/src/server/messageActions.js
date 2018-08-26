import {sendMessage} from './webSocket';
import constants from '../constants';

const {messageTypes, propertyTypes, groupValueTypes} = constants.server;

export default {
    undo: () => sendMessage({type: messageTypes.UNDO}),
    redo: () => sendMessage({type: messageTypes.REDO}),
    feature: {
        addBelow: belowFeatureName =>
            sendMessage({type: messageTypes.FEATURE_ADD_BELOW, belowFeature: belowFeatureName}),
        remove: featureName =>
            sendMessage({type: messageTypes.FEATURE_REMOVE, feature: featureName}),
        rename: (oldFeatureName, newFeatureName) =>
            sendMessage({type: messageTypes.FEATURE_RENAME, oldFeature: oldFeatureName, newFeature: newFeatureName}),
        setDescription: (featureName, description) =>
            sendMessage({type: messageTypes.FEATURE_SET_DESCRIPTION, feature: featureName, description}),
        properties: {
            setAbstract: (featureName, value) =>
                sendMessage({type: messageTypes.FEATURE_SET_PROPERTY,
                    feature: featureName, property: propertyTypes.abstract, value}),
            setHidden: (featureName, value) =>
                sendMessage({type: messageTypes.FEATURE_SET_PROPERTY,
                    feature: featureName, property: propertyTypes.hidden, value}),
            setMandatory: (featureName, value) =>
                sendMessage({type: messageTypes.FEATURE_SET_PROPERTY,
                    feature: featureName, property: propertyTypes.mandatory, value}),
            setAnd: featureName =>
                sendMessage({type: messageTypes.FEATURE_SET_PROPERTY,
                    feature: featureName, property: propertyTypes.group, value: groupValueTypes.and}),
            setOr: featureName =>
                sendMessage({type: messageTypes.FEATURE_SET_PROPERTY,
                    feature: featureName, property: propertyTypes.group, value: groupValueTypes.or}),
            setAlternative: featureName =>
                sendMessage({type: messageTypes.FEATURE_SET_PROPERTY,
                    feature: featureName, property: propertyTypes.group, value: groupValueTypes.alternative})
        }
    },
    features: {
        addAbove: aboveFeaturesNames =>
            sendMessage({type: messageTypes.FEATURE_ADD_ABOVE, aboveFeatures: aboveFeaturesNames})
    }
};