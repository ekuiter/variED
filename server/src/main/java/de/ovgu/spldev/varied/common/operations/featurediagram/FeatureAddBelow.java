package de.ovgu.spldev.varied.common.operations.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.common.operations.Operation;
import de.ovgu.spldev.varied.common.util.BridgeUtils;
import de.ovgu.spldev.varied.common.util.FeatureUtils;

import static de.ovgu.spldev.varied.common.util.BridgeUtils.DEFAULT_FEATURE_LAYER_CAPTION;

// adapted from CreateFeatureBelowOperation
public class FeatureAddBelow extends Operation {
    private IFeatureModel featureModel;
    private IFeature feature;
    private IFeature newFeature;

    public FeatureAddBelow(IFeatureModel featureModel, String belowFeature) {
        this.featureModel = featureModel;
        this.feature = FeatureUtils.requireFeature(featureModel, belowFeature);
    }

    public void apply() {
        int number = 1;

        while (BridgeUtils.getFeatureNames(featureModel).contains(DEFAULT_FEATURE_LAYER_CAPTION + number)) {
            number++;
        }

        newFeature = BridgeUtils.createFeature(featureModel, DEFAULT_FEATURE_LAYER_CAPTION + number);
        featureModel.addFeature(newFeature);
        feature = featureModel.getFeature(feature.getName());
        feature.getStructure().addChild(newFeature.getStructure());
    }

    public void undo() {
        newFeature = featureModel.getFeature(newFeature.getName());
        featureModel.deleteFeature(newFeature);
    }
}
