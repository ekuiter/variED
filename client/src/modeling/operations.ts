import MutableFeatureModel from './MutableFeatureModel';
import {FeatureAddAbove} from '../common/operations/featurediagram/FeatureAddAbove';
import {FeatureAddBelow} from '../common/operations/featurediagram/FeatureAddBelow';
import {FeatureRemove} from '../common/operations/featurediagram/FeatureRemove';
import {FeatureRename} from '../common/operations/featurediagram/FeatureRename';
import {FeatureSetDescription} from '../common/operations/featurediagram/FeatureSetDescription';
import {FeatureSetProperty} from '../common/operations/featurediagram/FeatureSetProperty';
import {Operation} from '../common/operations/Operation';
import {FeatureRemoveBelow} from '../common/operations/featurediagram/FeatureRemoveBelow';
import logger from '../helpers/logger';
import actions from '../store/actions';
import {MessageType} from '../types';
import {Store} from '../store/reducer';
import {getCurrentCollaborativeSession} from '../store/selectors';
import {FeatureDiagramCollaborativeSession} from '../store/types';

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

export const tryOperation = (_Operation: typeof Operation, ...args: any[]) => {
    const store: Store = (window as any).app && (window as any).app.store && (window as any).app.store;
    if (!store)
        logger.warn(() => 'store not accessible, can not try operation');
    const {artifactPath, serializedFeatureModel} = <FeatureDiagramCollaborativeSession>getCurrentCollaborativeSession(store.getState());
    const mutableFeatureModel = MutableFeatureModel.fromJSON(serializedFeatureModel),
        operation = new (_Operation as any)(mutableFeatureModel, ...args);
    operation.apply();
    const applied = mutableFeatureModel.toJSON();
    operation.undo();
    const undone = mutableFeatureModel.toJSON();
    operation.apply();
    const redone = mutableFeatureModel.toJSON();
    logger.log(() => ({applied, undone, redone}));
    store.dispatch(actions.server.receive({type: MessageType.FEATURE_DIAGRAM_FEATURE_MODEL, artifactPath, featureModel: applied}));
};