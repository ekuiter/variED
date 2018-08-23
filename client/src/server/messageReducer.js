import constants from '../constants';

const messageTypes = constants.server.messageTypes,
    messageReducers = {
        [messageTypes.ERROR](state, action) {
            console.warn(action.error);
            return state;
        },
        [messageTypes.ENDPOINT_SUBSCRIBE](state, action) {
            return {...state, endpoints: [...state.endpoints, action.endpoint]};
        },
        [messageTypes.ENDPOINT_UNSUBSCRIBE](state, action) {
            return {...state, endpoints: state.endpoints.filter(endpoint => endpoint !== action.endpoint)};
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