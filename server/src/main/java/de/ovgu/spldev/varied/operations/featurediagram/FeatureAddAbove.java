package de.ovgu.spldev.varied.operations.featurediagram;

import de.ovgu.spldev.varied.StateContext;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.operations.Operation;
import de.ovgu.spldev.varied.util.FeatureModelUtils;

public class FeatureAddAbove extends Operation {
    private StateContext.FeatureModel stateContext;
    de.ovgu.spldev.varied.common.operations.featurediagram.FeatureAddAbove featureAddAbove;

    public FeatureAddAbove(StateContext.FeatureModel stateContext, String[] aboveFeatures) {
        this.stateContext = stateContext;
        this.featureAddAbove = new de.ovgu.spldev.varied.common.operations.featurediagram.FeatureAddAbove(
                stateContext.getFeatureModel(), aboveFeatures);
    }

    public Message.IEncodable[] _apply() {
        featureAddAbove.apply();
        return FeatureModelUtils.toMessage(stateContext);
    }

    public Message.IEncodable[] _undo() {
        featureAddAbove.undo();
        return FeatureModelUtils.toMessage(stateContext);
    }
}
