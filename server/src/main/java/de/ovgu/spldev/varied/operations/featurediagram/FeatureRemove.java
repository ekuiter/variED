package de.ovgu.spldev.varied.operations.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.spldev.varied.StateContext;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.operations.Operation;
import de.ovgu.spldev.varied.util.FeatureModelUtils;

public class FeatureRemove extends Operation {
    private StateContext.FeatureModel stateContext;
    private de.ovgu.spldev.varied.common.operations.featurediagram.FeatureRemove featureRemove;

    FeatureRemove(StateContext.FeatureModel stateContext, IFeature feature) {
        this(stateContext, feature.getName());
    }

    public FeatureRemove(StateContext.FeatureModel stateContext, String feature) {
        this.stateContext = stateContext;
        this.featureRemove = new de.ovgu.spldev.varied.common.operations.featurediagram.FeatureRemove(
                stateContext.getFeatureModel(), feature);
    }

    public Message.IEncodable[] _apply() {
        featureRemove.apply();
        return FeatureModelUtils.toMessage(stateContext);
    }

    public Message.IEncodable[] _undo() {
        featureRemove.undo();
        return FeatureModelUtils.toMessage(stateContext);
    }
}
