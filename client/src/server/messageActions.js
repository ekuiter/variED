import Constants from '../Constants';

const messageTypes = Constants.server.messageTypes;

export default {
    undo: () => ({type: messageTypes.UNDO}),
    redo: () => ({type: messageTypes.REDO}),
    featureAdd: belowFeature => ({type: messageTypes.FEATURE_ADD, belowFeature}),
    featureDelete: feature => ({type: messageTypes.FEATURE_DELETE, feature}),
    featureNameChanged: (oldFeature, newFeature) => ({type: messageTypes.FEATURE_NAME_CHANGED, oldFeature, newFeature})
};