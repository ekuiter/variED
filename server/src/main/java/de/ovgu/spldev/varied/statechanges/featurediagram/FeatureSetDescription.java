package de.ovgu.spldev.varied.statechanges.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.FeatureModelUtils;
import de.ovgu.spldev.varied.FeatureUtils;
import de.ovgu.spldev.varied.Message;
import de.ovgu.spldev.varied.statechanges.StateChange;
import de.ovgu.spldev.varied.StringUtils;

import java.util.Objects;

public class FeatureSetDescription extends StateChange {
    private IFeatureModel featureModel;
    private IFeature feature;
    private String oldDescription, description;

    public FeatureSetDescription(IFeatureModel featureModel, String feature, String description) {
        this.featureModel = featureModel;
        this.feature = FeatureUtils.requireFeature(featureModel, feature);
        this.oldDescription = this.feature.getProperty().getDescription();
        this.description = description;
        if (!StringUtils.isPresent(description) && !Objects.equals(description, ""))
            throw new RuntimeException("no description given");
    }

    public Message.IEncodable[] _apply() {
        feature.getProperty().setDescription(description);
        return FeatureModelUtils.toMessage(featureModel);
    }

    public Message.IEncodable[] _undo() {
        feature.getProperty().setDescription(oldDescription);
        return FeatureModelUtils.toMessage(featureModel);
    }
}
