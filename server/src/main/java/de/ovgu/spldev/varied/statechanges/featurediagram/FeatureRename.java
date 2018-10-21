package de.ovgu.spldev.varied.statechanges.featurediagram;

import de.ovgu.spldev.varied.StateContext;
import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.statechanges.StateChange;
import de.ovgu.spldev.varied.util.FeatureUtils;
import de.ovgu.spldev.varied.util.StringUtils;

// adapted from RenameFeatureOperation
public class FeatureRename extends StateChange {
    private StateContext.FeatureModel stateContext;
    private final String oldName;
    private final String newName;

    public FeatureRename(StateContext.FeatureModel stateContext, String oldName, String newName) {
        this.stateContext = stateContext;
        if (!StringUtils.isPresent(newName))
            throw new RuntimeException("no new feature name given");
        this.oldName = oldName;
        this.newName = newName;
        FeatureUtils.requireFeature(stateContext.getFeatureModel(), oldName);
    }

    public Message.IEncodable[] _apply() {
        if (!stateContext.getFeatureModel().getRenamingsManager().renameFeature(oldName, newName))
            throw new RuntimeException("invalid renaming operation");
        return new Message.IEncodable[]{
                new Api.FeatureDiagramFeatureRename(stateContext.getArtifactPath(), oldName, newName),
                new Api.FeatureDiagramFeatureModel(stateContext.getArtifactPath(), stateContext.getFeatureModel())
        };
    }

    public Message.IEncodable[] _undo() {
        if (!stateContext.getFeatureModel().getRenamingsManager().renameFeature(newName, oldName))
            throw new RuntimeException("invalid renaming operation");
        return new Message.IEncodable[]{
                new Api.FeatureDiagramFeatureRename(stateContext.getArtifactPath(), newName, oldName),
                new Api.FeatureDiagramFeatureModel(stateContext.getArtifactPath(), stateContext.getFeatureModel())
        };
    }
}
