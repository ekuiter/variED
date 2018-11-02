package de.ovgu.spldev.varied.operations.featurediagram;

import de.ovgu.spldev.varied.StateContext;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.operations.Operation;
import de.ovgu.spldev.varied.util.FeatureModelUtils;

public class FeatureSetDescription extends Operation {
    private StateContext.FeatureModel stateContext;
    private de.ovgu.spldev.varied.common.operations.featurediagram.FeatureSetDescription featureSetDescription;

    public FeatureSetDescription(StateContext.FeatureModel stateContext, String feature, String description) {
        this.stateContext = stateContext;
        this.featureSetDescription = new de.ovgu.spldev.varied.common.operations.featurediagram.FeatureSetDescription(
                stateContext.getFeatureModel(), feature, description);
    }

    public Message.IEncodable[] _apply() {
        featureSetDescription.apply();
        return FeatureModelUtils.toMessage(stateContext);
    }

    public Message.IEncodable[] _undo() {
        featureSetDescription.undo();
        return FeatureModelUtils.toMessage(stateContext);
    }
}
