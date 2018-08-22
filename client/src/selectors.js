import { createSelector } from 'reselect';
import FeatureModel from './server/FeatureModel';

export const getFeatureModel = createSelector(
    state => state.server.featureModel,
    featureModel => featureModel ? new FeatureModel(featureModel) : null
);