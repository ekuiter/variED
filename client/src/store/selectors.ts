/**
 * Selectors are used to cache objects that result from the Redux state.
 * For example, a feature model should not be recomputed every time any part of the Redux
 * store changes, but only when parts related to the feature model change.
 */

import {createSelector} from 'reselect';
import FeatureModel from '../server/FeatureModel';

export const getFeatureModel = createSelector(
    (state: any) => state.server.featureModel, // TODO: proper state type
    (state: any) => state.ui.collapsedFeatureNames,
    (featureModel: FeatureModel, collapsedFeatureNames: string[]) =>
        featureModel ? new FeatureModel(featureModel, collapsedFeatureNames) : undefined
);