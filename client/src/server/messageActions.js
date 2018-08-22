import {sendMessage} from './webSocket';
import Constants from '../Constants';

const messageTypes = Constants.server.messageTypes;

export default {
    undo: () => sendMessage({type: messageTypes.UNDO}),
    redo: () => sendMessage({type: messageTypes.REDO}),
    featureAdd: belowFeatureName =>
        sendMessage({type: messageTypes.FEATURE_ADD, belowFeature: belowFeatureName}),
    featureDelete: featureName =>
        sendMessage({type: messageTypes.FEATURE_DELETE, feature: featureName}),
    featureNameChanged: (oldFeatureName, newFeatureName) =>
        sendMessage({type: messageTypes.FEATURE_NAME_CHANGED, oldFeature: oldFeatureName, newFeature: newFeatureName})
};