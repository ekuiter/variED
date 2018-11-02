import {SerializedFeatureModel} from './types';
import MutableFeatureModel from './MutableFeatureModel';
import {FeatureAddAbove} from '../common/operations/featurediagram/FeatureAddAbove';

export default (serializedFeatureModel: SerializedFeatureModel, aboveFeatureNames: string[]) => {
    const mutableFeatureModel = MutableFeatureModel.fromJSON(serializedFeatureModel);
    new FeatureAddAbove(mutableFeatureModel, aboveFeatureNames).apply();
    return mutableFeatureModel.toJSON();
};