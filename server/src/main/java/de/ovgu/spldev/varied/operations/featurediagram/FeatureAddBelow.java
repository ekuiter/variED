package de.ovgu.spldev.varied.operations.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.impl.FMFactoryManager;
import de.ovgu.spldev.varied.StateContext;
import de.ovgu.spldev.varied.util.FeatureModelUtils;
import de.ovgu.spldev.varied.util.FeatureUtils;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.operations.Operation;

import static de.ovgu.featureide.fm.core.localization.StringTable.DEFAULT_FEATURE_LAYER_CAPTION;

// adapted from CreateFeatureBelowOperation
public class FeatureAddBelow extends Operation {
    private StateContext.FeatureModel stateContext;
    private IFeature feature;
    private IFeature newFeature;

    public FeatureAddBelow(StateContext.FeatureModel stateContext, String belowFeature) {
        this.stateContext = stateContext;
        this.feature = FeatureUtils.requireFeature(stateContext.getFeatureModel(), belowFeature);
    }

    public Message.IEncodable[] _apply() {
        IFeatureModel featureModel = stateContext.getFeatureModel();
        int number = 1;

        while (de.ovgu.featureide.fm.core.base.FeatureUtils.getFeatureNames(featureModel).contains(DEFAULT_FEATURE_LAYER_CAPTION + number)) {
            number++;
        }

        newFeature = FMFactoryManager.getFactory(featureModel).createFeature(featureModel, DEFAULT_FEATURE_LAYER_CAPTION + number);
        featureModel.addFeature(newFeature);
        feature = featureModel.getFeature(feature.getName());
        feature.getStructure().addChild(newFeature.getStructure());

        return FeatureModelUtils.toMessage(stateContext);
    }

    public Message.IEncodable[] _undo() {
        newFeature = stateContext.getFeatureModel().getFeature(newFeature.getName());
        stateContext.getFeatureModel().deleteFeature(newFeature);
        return FeatureModelUtils.toMessage(stateContext);
    }
}
