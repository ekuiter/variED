import reducer from './reducer';
import constants from '../constants';
import {validFeatureModel, validFeatureModelWithRemovedFeatures} from '../fixtures';
import {MessageType} from '../types';
import {SERVER_RECEIVE} from './actions';

const initialState = constants.store.initialState;

describe('reducer', () => {
    let consoleWarn = console.warn;
    beforeEach(() => console.warn = jest.fn());
    afterEach(() => console.warn = consoleWarn);

    it('does not process messages with invalid type', () => {
        expect(reducer(initialState,
            {payload: {type: 'invalid message type'}} as any)).toBe(initialState);
        expect(console.warn).lastCalledWith(expect.stringMatching('no message reducer defined'));
    });

    it('warns on errors', () => {
        expect(reducer(initialState,
            {type: SERVER_RECEIVE, payload: {type: MessageType.ERROR, error: 'some error'}})).toBe(initialState);
        expect(console.warn).lastCalledWith('some error');
    });

    it('lets users join', () => {
        const state = reducer(initialState,
            {type: SERVER_RECEIVE, payload: {type: MessageType.USER_JOINED, user: 'some user'}});
        expect(state.server.users).toContain('some user');
    });

    it('does not let users join multiple times', () => {
        let state = reducer(initialState,
            {type: SERVER_RECEIVE, payload: {type: MessageType.USER_JOINED, user: 'some user'}});
        expect(state.server.users).toHaveLength(1);
        state = reducer(state,
            {type: SERVER_RECEIVE, payload: {type: MessageType.USER_JOINED, user: 'some user'}});
        expect(state.server.users).toHaveLength(1);
    });

    it('lets users leave', () => {
        let state = reducer(initialState,
            {type: SERVER_RECEIVE, payload: {type: MessageType.USER_JOINED, user: 'some user'}});
        expect(state.server.users).toContain('some user');
        state = reducer(initialState,
            {type: SERVER_RECEIVE, payload: {type: MessageType.USER_LEFT, user: 'some user'}});
        expect(state.server.users).not.toContain('some user');
    });

    it('updates the feature model', () => {
        let state = reducer(initialState,
            {type: SERVER_RECEIVE, payload: {type: MessageType.FEATURE_DIAGRAM_FEATURE_MODEL, featureModel: validFeatureModel}});
        expect(state.server.featureModel).toBe(validFeatureModel);
        state = reducer(initialState,
            {type: SERVER_RECEIVE, payload: {type: MessageType.FEATURE_DIAGRAM_FEATURE_MODEL, featureModel: validFeatureModelWithRemovedFeatures}});
        expect(state.server.featureModel).toBe(validFeatureModelWithRemovedFeatures);
    });

    it('does nothing when renaming a feature', () => {
        expect(reducer(initialState, {type: SERVER_RECEIVE, payload: {type: MessageType.FEATURE_DIAGRAM_FEATURE_RENAME}})).toBe(initialState);
    });
});