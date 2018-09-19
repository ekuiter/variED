import {createSelector} from 'reselect';
import FeatureModel from '../server/FeatureModel';

export const getFeatureModel = createSelector(
    (state: any) => state.server.featureModel, // TODO: proper state type
    (state: any) => state.ui.collapsedFeatureNames,
    (featureModel: FeatureModel, collapsedFeatureNames: string[]) =>
        featureModel ? new FeatureModel(featureModel, collapsedFeatureNames) : undefined
);