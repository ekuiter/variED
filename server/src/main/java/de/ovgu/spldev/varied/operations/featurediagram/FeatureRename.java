package de.ovgu.spldev.varied.operations.featurediagram;

import de.ovgu.spldev.varied.StateContext;
import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.operations.Operation;

public class FeatureRename extends Operation {
    private StateContext.FeatureModel stateContext;
    private de.ovgu.spldev.varied.common.operations.featurediagram.FeatureRename featureRename;
    private final String oldName;
    private final String newName;

    public FeatureRename(StateContext.FeatureModel stateContext, String oldName, String newName) {
        this.stateContext = stateContext;
        this.featureRename = new de.ovgu.spldev.varied.common.operations.featurediagram.FeatureRename(
                stateContext.getFeatureModel(), oldName, newName);
        this.oldName = oldName;
        this.newName = newName;
    }

    public Message.IEncodable[] _apply() {
        featureRename.apply();
        return new Message.IEncodable[]{
                new Api.FeatureDiagramFeatureRename(stateContext.getArtifactPath(), oldName, newName),
                new Api.FeatureDiagramFeatureModel(stateContext.getArtifactPath(), stateContext.getFeatureModel())
        };
    }

    public Message.IEncodable[] _undo() {
        featureRename.undo();
        return new Message.IEncodable[]{
                new Api.FeatureDiagramFeatureRename(stateContext.getArtifactPath(), newName, oldName),
                new Api.FeatureDiagramFeatureModel(stateContext.getArtifactPath(), stateContext.getFeatureModel())
        };
    }
}
