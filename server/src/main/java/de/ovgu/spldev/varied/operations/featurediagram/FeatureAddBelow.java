package de.ovgu.spldev.varied.operations.featurediagram;

import de.ovgu.spldev.varied.StateContext;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.operations.Operation;
import de.ovgu.spldev.varied.util.FeatureModelUtils;

public class FeatureAddBelow extends Operation {
    private StateContext.FeatureModel stateContext;
    private de.ovgu.spldev.varied.common.operations.featurediagram.FeatureAddBelow featureAddBelow;

    public FeatureAddBelow(StateContext.FeatureModel stateContext, String belowFeature) {
        this.stateContext = stateContext;
        this.featureAddBelow = new de.ovgu.spldev.varied.common.operations.featurediagram.FeatureAddBelow(
                stateContext.getFeatureModel(), belowFeature);
    }

    public Message.IEncodable[] _apply() {
        featureAddBelow.apply();
        return FeatureModelUtils.toMessage(stateContext);
    }

    public Message.IEncodable[] _undo() {
        featureAddBelow.undo();
        return FeatureModelUtils.toMessage(stateContext);
    }
}
