import Constants from '../Constants';

const messageTypes = Constants.server.messageTypes,
    messageReducers = {
    [messageTypes.FEATURE_MODEL](state, action) {
        return {...state, featureModel: action.featureModel};
    }
};

export default (state, action) => {
    if (Object.keys(messageReducers).includes(action.type))
        return messageReducers[action.type](state, action);
    else {
        console.warn('no message reducer defined for action type ' + action.type);
        return state;
    }
};