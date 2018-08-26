import {sendMessage} from './webSocket';
import constants from '../constants';

const messageTypes = constants.server.messageTypes;

export default {
    undo: () => sendMessage({type: messageTypes.UNDO}),
    redo: () => sendMessage({type: messageTypes.REDO}),
    feature: {
        addBelow: belowFeatureName =>
            sendMessage({type: messageTypes.FEATURE_ADD_BELOW, belowFeature: belowFeatureName}),
        addAbove: aboveFeaturesNames =>
            sendMessage({type: messageTypes.FEATURE_ADD_ABOVE, aboveFeatures: aboveFeaturesNames}),
        remove: featureName =>
            sendMessage({type: messageTypes.FEATURE_REMOVE, feature: featureName}),
        rename: (oldFeatureName, newFeatureName) =>
            sendMessage({type: messageTypes.FEATURE_RENAME, oldFeature: oldFeatureName, newFeature: newFeatureName}),
        setDescription: (featureName, description) =>
            sendMessage({type: messageTypes.FEATURE_SET_DESCRIPTION, feature: featureName, description})
    }
};