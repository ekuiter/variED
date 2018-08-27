import { createSelector } from 'reselect';
import FeatureModel from '../server/FeatureModel';

export const getFeatureModel = createSelector(
    state => state.server.featureModel,
    state => state.ui.collapsedFeatureNames,
    (featureModel, collapsedFeatureNames) => featureModel ? new FeatureModel(featureModel, collapsedFeatureNames) : null
);