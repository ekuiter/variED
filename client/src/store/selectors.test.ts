import {getFeatureModel} from './selectors';
import {validFeatureModel, invalidFeatureModel1} from '../fixtures';
import FeatureModel from '../server/FeatureModel';
import {initialState} from './types';

describe('selectors', () => {
    describe('getFeatureModel', () => {
        it('gets no feature model from the initial store state', () => {
            expect(getFeatureModel(initialState)).toBeUndefined();
        });

        it('gets a feature model from a loaded store state', () => {
            const state = <any>{
                server: {featureModel: validFeatureModel},
                ui: {featureDiagram: {collapsedFeatureNames: []}}
            };
            expect(getFeatureModel(state)!.featureModel)
                .toEqual(new FeatureModel(validFeatureModel, []).featureModel);
        });

        it('recomputes when the store state changes', () => {
            let state: any = {server: {}, ui: {featureDiagram: {}}};
            const collapsedFeatureNames = ['test1'];
            getFeatureModel.resetRecomputations();

            state.server.featureModel = invalidFeatureModel1;
            state.ui.featureDiagram.collapsedFeatureNames = collapsedFeatureNames;
            getFeatureModel(state);
            expect(getFeatureModel.recomputations()).toBe(1);

            state = {server: {}, ui: {featureDiagram: {}}};
            state.server.featureModel = invalidFeatureModel1;
            state.ui.featureDiagram.collapsedFeatureNames = collapsedFeatureNames;
            getFeatureModel(state);
            expect(getFeatureModel.recomputations()).toBe(1);

            state = {server: {}, ui: {featureDiagram: {}}};
            state.server.featureModel = validFeatureModel;
            state.ui.featureDiagram.collapsedFeatureNames = collapsedFeatureNames;
            getFeatureModel(state);
            expect(getFeatureModel.recomputations()).toBe(2);
        });
    });
});