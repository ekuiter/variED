import constants from '../constants';

const messageTypes = constants.server.messageTypes,
    messageReducers = {
        [messageTypes.ERROR](state, action) {
            console.warn(action.error);
            return state;
        },
        [messageTypes.USER_SUBSCRIBE](state, action) {
            return {...state, users: [...state.users, action.user]};
        },
        [messageTypes.USER_UNSUBSCRIBE](state, action) {
            return {...state, users: state.users.filter(user => user !== action.user)};
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