import FeatureModel, {Constraint} from './FeatureModel';
import {KernelConstraintFormula, FORMULA, GRAVEYARDED} from './types';

const featureExists = (featureID: string, featureModel: FeatureModel): boolean => !!featureModel.getFeature(featureID);
const featuresExist = (featureIDs: string[], featureModel: FeatureModel): boolean =>
    featureIDs.length === featureModel.getFeatures(featureIDs).length;

export const preconditions = {
    featureDiagram: {
        feature: {
            createBelow: featureExists,

            createAbove: (featureIDs: string[], featureModel: FeatureModel): boolean => {
                if (featureIDs.length === 0 || !featuresExist(featureIDs, featureModel))
                    return false;
                return featureModel.isSiblingFeatures(featureIDs);
            },

            remove: (featureIDs: string[], featureModel: FeatureModel): boolean => {
                if (!featuresExist(featureIDs, featureModel))
                    return false;
                let checkFeature = featureModel.rootFeature;
                while (true) {
                    if (featureIDs.includes(checkFeature.ID)) {
                        if (!checkFeature.hasChildren || checkFeature.node.children!.length > 1)
                            return false;
                        checkFeature = checkFeature.node.children![0].feature();
                    } else
                        return true;
                }
            },

            removeSubtree: (featureIDs: string[], featureModel: FeatureModel): boolean => {
                const features = featureModel.getFeatures(featureIDs);
                if (featureIDs.length !== features.length)
                    return false;
                return !features.some(feature => feature.isRoot);
            },

            moveSubtree: (featureID: string, featureParentID: string, featureModel: FeatureModel): boolean =>
                !featureModel.getFeature(featureID)!.getFeatureIDsBelow().includes(featureParentID),

            setName: featureExists,
            setDescription: featureExists,

            properties: {
                setAbstract: featuresExist,
                setHidden: featuresExist,

                setOptional: (featureIDs: string[], featureModel: FeatureModel): boolean => {
                    const features = featureModel.getFeatures(featureIDs);
                    if (featureIDs.length !== features.length)
                        return false;
                    return !features.some(feature => feature.isRoot || feature.node.parent!.feature().isGroup);
                },

                setGroupType: (featureIDs: string[], featureModel: FeatureModel): boolean => {
                    const features = featureModel.getFeatures(featureIDs);
                    if (featureIDs.length !== features.length)
                        return false;
                    return !features.some(feature => !feature.node.children || feature.node.children.length <= 1);
                }
            }
        },

        constraint: {
            create: (formula: KernelConstraintFormula, featureModel: FeatureModel): boolean =>
                !new Constraint({
                    [FORMULA]: formula,
                    [GRAVEYARDED]: false
                }, featureModel).isGraveyarded,

            set: (constraintID: string, formula: KernelConstraintFormula, featureModel: FeatureModel): boolean => 
                !!featureModel.getConstraint(constraintID) &&
                !new Constraint({
                    [FORMULA]: formula,
                    [GRAVEYARDED]: false
                }, featureModel).isGraveyarded,

            remove: (constraintID: string, featureModel: FeatureModel): boolean =>
                !!featureModel.getConstraint(constraintID)
        }
    }
};