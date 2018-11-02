package de.ovgu.spldev.varied.operations.featurediagram;

import de.ovgu.spldev.varied.StateContext;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.operations.Operation;
import de.ovgu.spldev.varied.util.FeatureModelUtils;

public class FeatureSetProperty extends Operation {
    private StateContext.FeatureModel stateContext;
    private de.ovgu.spldev.varied.common.operations.featurediagram.FeatureSetProperty featureSetProperty;

    public FeatureSetProperty(StateContext.FeatureModel stateContext, String feature, String property, String value) {
        this(stateContext, feature, property, value, null);
    }

    public FeatureSetProperty(StateContext.FeatureModel stateContext, String feature, String property, String value, Object batchContext) {
        this.stateContext = stateContext;
        this.featureSetProperty = new de.ovgu.spldev.varied.common.operations.featurediagram.FeatureSetProperty(
                stateContext.getFeatureModel(), feature, property, value, batchContext);
    }

    public Message.IEncodable[] _apply() {
        featureSetProperty.apply();
        return FeatureModelUtils.toMessage(stateContext);
    }

    public Message.IEncodable[] _undo() {
        featureSetProperty.undo();
        return FeatureModelUtils.toMessage(stateContext);
    }
}
