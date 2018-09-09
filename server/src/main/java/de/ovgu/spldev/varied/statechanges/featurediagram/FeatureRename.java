package de.ovgu.spldev.varied.statechanges.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.FeatureUtils;
import de.ovgu.spldev.varied.Message;
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
                new Message.FeatureDiagramFeatureRename(oldName, newName),
                new Message.FeatureDiagramFeatureModel(featureModel)
        };
    }

    public Message.IEncodable[] _undo() {
        if (!featureModel.getRenamingsManager().renameFeature(newName, oldName))
            throw new RuntimeException("invalid renaming operation");
        return new Message.IEncodable[]{
                new Message.FeatureDiagramFeatureRename(newName, oldName),
                new Message.FeatureDiagramFeatureModel(featureModel)
        };
    }
}
