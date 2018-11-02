import {SerializedFeatureModel} from './types';
import MutableFeatureModel from './MutableFeatureModel';
import {FeatureAddAbove} from '../common/operations/featurediagram/FeatureAddAbove';
import {FeatureAddBelow} from '../common/operations/featurediagram/FeatureAddBelow';
import {FeatureRemove} from '../common/operations/featurediagram/FeatureRemove';
import {FeatureRename} from '../common/operations/featurediagram/FeatureRename';
import {FeatureSetDescription} from '../common/operations/featurediagram/FeatureSetDescription';
import {FeatureSetProperty} from '../common/operations/featurediagram/FeatureSetProperty';
import {Operation} from '../common/operations/Operation';
import {FeatureRemoveBelow} from '../common/operations/featurediagram/FeatureRemoveBelow';

export const operations = {
    featureDiagram: {
        feature: {
            addAbove: FeatureAddAbove,
            addBelow: FeatureAddBelow,
            remove: FeatureRemove,
            removeBelow: FeatureRemoveBelow,
            rename: FeatureRename,
            setDescription: FeatureSetDescription,
            setProperty: FeatureSetProperty
        }
    }
};

export const tryOperation = (_Operation: typeof Operation, serializedFeatureModel: SerializedFeatureModel, ...args: any[]) => {
    const mutableFeatureModel = MutableFeatureModel.fromJSON(serializedFeatureModel),
        operation = new (_Operation as any)(mutableFeatureModel, ...args);
    operation.apply();
    const applied = mutableFeatureModel.toJSON();
    operation.undo();
    const undone = mutableFeatureModel.toJSON();
    operation.apply();
    const redone = mutableFeatureModel.toJSON();
    return {applied, undone, redone};
};