import {getFeatureModel} from './selectors';
import {validFeatureModel, invalidFeatureModel1} from '../fixtures';
import FeatureModel from '../server/FeatureModel';
import constants from '../constants';

describe('selectors', () => {
    describe('getFeatureModel', () => {
        it('gets no feature model from the initial store state', () => {
            const state = constants.store.initialState;
            expect(getFeatureModel(state)).toBeUndefined();
        });

        it('gets a feature model from a loaded store state', () => {
            const state = {
                server: {featureModel: validFeatureModel},
                ui: {collapsedFeatureNames: []}
            };
            expect(getFeatureModel(state)!.featureModel)
                .toEqual(new FeatureModel(validFeatureModel, []).featureModel);
        });

        it('recomputes when the store state changes', () => {
            let state: any = {server: {}, ui: {}};
            const collapsedFeatureNames = ['test1'];
            getFeatureModel.resetRecomputations();

            state.server.featureModel = invalidFeatureModel1;
            state.ui.collapsedFeatureNames = collapsedFeatureNames;
            getFeatureModel(state);
            expect(getFeatureModel.recomputations()).toBe(1);

            state = {server: {}, ui: {}};
            state.server.featureModel = invalidFeatureModel1;
            state.ui.collapsedFeatureNames = collapsedFeatureNames;
            getFeatureModel(state);
            expect(getFeatureModel.recomputations()).toBe(1);

            state = {server: {}, ui: {}};
            state.server.featureModel = validFeatureModel;
            state.ui.collapsedFeatureNames = collapsedFeatureNames;
            getFeatureModel(state);
            expect(getFeatureModel.recomputations()).toBe(2);
        });
    });
});