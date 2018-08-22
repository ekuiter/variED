import constants from '../constants';

const messageTypes = constants.server.messageTypes,
    messageReducers = {
        [messageTypes.ERROR](state, action) {
            console.warn(action.error);
            return state;
        },
        [messageTypes.ENDPOINT_SUBSCRIBE](state, action) {
            console.log(`${action.endpoint} subscribed`);
            return state;
        },
        [messageTypes.ENDPOINT_UNSUBSCRIBE](state, action) {
            console.log(`${action.endpoint} unsubscribed`);
            return state;
        },
        [messageTypes.FEATURE_MODEL](state, action) {
            return {...state, featureModel: action.featureModel};
        }
    };

export default (state, action) => {
    if (Object.keys(messageReducers).includes(action.type))
        return messageReducers[action.type](state, action);
    else {
        console.warn(`no message reducer defined for action type ${action.type}`);
        return state;
    }
};