package de.ovgu.spldev.varied.common.operations.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.common.operations.Operation;
import de.ovgu.spldev.varied.common.util.BridgeUtils;
import de.ovgu.spldev.varied.common.util.FeatureUtils;

// adapted from CreateFeatureBelowOperation
public class FeatureAddBelow extends Operation {
    private IFeatureModel featureModel;
    private IFeature feature;
    private IFeature newFeature;
    private String newFeatureUUID;

    public FeatureAddBelow(IFeatureModel featureModel, String belowFeatureUUID, String newFeatureUUID) throws InvalidOperationException {
        this.featureModel = featureModel;
        this.feature = FeatureUtils.requireFeature(featureModel, belowFeatureUUID);
        this.newFeatureUUID = BridgeUtils.requireValidFeatureUUID(featureModel, newFeatureUUID);
    }

    protected void _apply() {
        newFeature = BridgeUtils.createFeature(featureModel, newFeatureUUID);
        FeatureUtils.setFeatureName(newFeature, newFeatureUUID); // TODO: choose a better default name
        featureModel.addFeature(newFeature);
        feature = featureModel.getFeature(feature.getName());
        feature.getStructure().addChild(newFeature.getStructure());
    }

    protected void _undo() {
        newFeature = featureModel.getFeature(newFeature.getName());
        featureModel.deleteFeature(newFeature);
    }
}
