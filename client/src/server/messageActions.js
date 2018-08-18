import Constants from '../Constants';
import {sendMessage} from './webSocket';

const messageTypes = Constants.server.messageTypes;

export default {
    undo: () => sendMessage({type: messageTypes.UNDO}),
    redo: () => sendMessage({type: messageTypes.REDO}),
    featureAdd: belowFeature =>
        sendMessage({type: messageTypes.FEATURE_ADD, belowFeature}),
    featureDelete: feature =>
        sendMessage({type: messageTypes.FEATURE_DELETE, feature}),
    featureNameChanged: (oldFeature, newFeature) =>
        sendMessage({type: messageTypes.FEATURE_NAME_CHANGED, oldFeature, newFeature})
};