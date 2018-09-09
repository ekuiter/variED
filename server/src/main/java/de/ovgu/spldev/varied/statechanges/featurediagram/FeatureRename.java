package de.ovgu.spldev.varied.statechanges.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.util.FeatureUtils;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.statechanges.StateChange;

// adapted from RenameFeatureOperation
public class FeatureRename extends StateChange {
    private IFeatureModel featureModel;
    private final String oldName;
    private final String newName;

    public FeatureRename(IFeatureModel featureModel, String oldName, String newName) {
        this.featureModel = featureModel;
        this.oldName = oldName;
        this.newName = newName;
        FeatureUtils.requireFeature(featureModel, oldName);
    }

    public Message.IEncodable[] _apply() {
        if (!featureModel.getRenamingsManager().renameFeature(oldName, newName))
            throw new RuntimeException("invalid renaming operation");
        return new Message.IEncodable[]{
                new Api.FeatureDiagramFeatureRename(oldName, newName),
                new Api.FeatureDiagramFeatureModel(featureModel)
        };
    }

    public Message.IEncodable[] _undo() {
        if (!featureModel.getRenamingsManager().renameFeature(newName, oldName))
            throw new RuntimeException("invalid renaming operation");
        return new Message.IEncodable[]{
                new Api.FeatureDiagramFeatureRename(newName, oldName),
                new Api.FeatureDiagramFeatureModel(featureModel)
        };
    }
}
