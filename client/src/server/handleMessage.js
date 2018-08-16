import Constants from '../Constants';

export function handleMessage(message) {
    return message => {
        if (message.type === Constants.message.FEATURE_MODEL)
            ;// TODO: dispatch({data: message.featureModel.struct[0]});
    }
}