package de.ovgu.spldev.varied.statechanges.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.StateContext;
import de.ovgu.spldev.varied.util.FeatureModelUtils;
import de.ovgu.spldev.varied.util.FeatureUtils;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.statechanges.StateChange;
import de.ovgu.spldev.varied.util.StringUtils;

import java.util.Objects;

public class FeatureSetDescription extends StateChange {
    private StateContext.FeatureModel stateContext;
    private IFeature feature;
    private String oldDescription, description;

    public FeatureSetDescription(StateContext.FeatureModel stateContext, String feature, String description) {
        this.stateContext = stateContext;
        this.feature = FeatureUtils.requireFeature(stateContext.getFeatureModel(), feature);
        this.oldDescription = this.feature.getProperty().getDescription();
        this.description = description;
        if (!StringUtils.isPresent(description) && !Objects.equals(description, ""))
            throw new RuntimeException("no description given");
    }

    public Message.IEncodable[] _apply() {
        feature.getProperty().setDescription(description);
        return FeatureModelUtils.toMessage(stateContext);
    }

    public Message.IEncodable[] _undo() {
        feature.getProperty().setDescription(oldDescription);
        return FeatureModelUtils.toMessage(stateContext);
    }
}
