import messageReducer from './messageReducer';
import constants from '../constants';
import {validFeatureModel, validFeatureModelWithRemovedFeatures} from '../fixtures';

const {messageTypes} = constants.server,
    initialState = constants.store.initialState.server;

describe('messageReducer', () => {
    let consoleWarn = global.console.warn;
    beforeAll(() => global.console.warn = jest.fn());
    afterAll(() => global.console.warn = consoleWarn);

    it('does not process messages with invalid type', () => {
        /*global global*/
        global.console.warn = jest.fn();
        expect(messageReducer(initialState, {type: 'invalid message type'})).toBe(initialState);
        expect(global.console.warn).lastCalledWith(expect.stringMatching('no message reducer defined'));
    });

    it('warns on errors', () => {
        /*global global*/
        global.console.warn = jest.fn();
        expect(messageReducer(initialState,
            {type: messageTypes.ERROR, error: 'some error'})).toBe(initialState);
        expect(global.console.warn).lastCalledWith('some error');
    });

    it('subscribes users', () => {
        const state = messageReducer(initialState,
            {type: messageTypes.USER_SUBSCRIBE, user: 'some user'});
        expect(state.users).toContain('some user');
    });

    it('does not subscribe users multiple times', () => {
        let state = messageReducer(initialState,
            {type: messageTypes.USER_SUBSCRIBE, user: 'some user'});
        expect(state.users).toHaveLength(1);
        state = messageReducer(state,
            {type: messageTypes.USER_SUBSCRIBE, user: 'some user'});
        expect(state.users).toHaveLength(1);
    });

    it('unsubscribes users', () => {
        let state = messageReducer(initialState,
            {type: messageTypes.USER_SUBSCRIBE, user: 'some user'});
        expect(state.users).toContain('some user');
        state = messageReducer(initialState,
            {type: messageTypes.USER_UNSUBSCRIBE, user: 'some user'});
        expect(state.users).not.toContain('some user');
    });

    it('updates the feature model', () => {
        let state = messageReducer(initialState,
            {type: messageTypes.FEATURE_MODEL, featureModel: validFeatureModel});
        expect(state.featureModel).toBe(validFeatureModel);
        state = messageReducer(initialState,
            {type: messageTypes.FEATURE_MODEL, featureModel: validFeatureModelWithRemovedFeatures});
        expect(state.featureModel).toBe(validFeatureModelWithRemovedFeatures);
    });

    it('does nothing when renaming a feature', () => {
        expect(messageReducer(initialState, {type: messageTypes.FEATURE_RENAME})).toBe(initialState);
    });
});