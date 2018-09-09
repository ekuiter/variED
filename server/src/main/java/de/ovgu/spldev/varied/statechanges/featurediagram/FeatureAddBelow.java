package de.ovgu.spldev.varied.statechanges.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.impl.FMFactoryManager;
import de.ovgu.spldev.varied.FeatureModelUtils;
import de.ovgu.spldev.varied.FeatureUtils;
import de.ovgu.spldev.varied.Message;
import de.ovgu.spldev.varied.statechanges.StateChange;

import static de.ovgu.featureide.fm.core.localization.StringTable.DEFAULT_FEATURE_LAYER_CAPTION;

// adapted from CreateFeatureBelowOperation
public class FeatureAddBelow extends StateChange {
    private IFeatureModel featureModel;
    private IFeature feature;
    private IFeature newFeature;

    public FeatureAddBelow(IFeatureModel featureModel, String belowFeature) {
        this.featureModel = featureModel;
        this.feature = FeatureUtils.requireFeature(featureModel, belowFeature);
    }

    public Message.IEncodable[] _apply() {
        int number = 1;

        while (de.ovgu.featureide.fm.core.base.FeatureUtils.getFeatureNames(featureModel).contains(DEFAULT_FEATURE_LAYER_CAPTION + number)) {
            number++;
        }

        newFeature = FMFactoryManager.getFactory(featureModel).createFeature(featureModel, DEFAULT_FEATURE_LAYER_CAPTION + number);
        featureModel.addFeature(newFeature);
        feature = featureModel.getFeature(feature.getName());
        feature.getStructure().addChild(newFeature.getStructure());

        return FeatureModelUtils.toMessage(featureModel);
    }

    public Message.IEncodable[] _undo() {
        newFeature = featureModel.getFeature(newFeature.getName());
        featureModel.deleteFeature(newFeature);
        return FeatureModelUtils.toMessage(featureModel);
    }
}
