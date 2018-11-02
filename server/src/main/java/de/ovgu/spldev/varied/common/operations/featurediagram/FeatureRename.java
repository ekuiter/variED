package de.ovgu.spldev.varied.common.operations.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.common.operations.Operation;
import de.ovgu.spldev.varied.common.util.FeatureUtils;
import de.ovgu.spldev.varied.common.util.StringUtils;

// adapted from RenameFeatureOperation
public class FeatureRename extends Operation {
    private IFeatureModel featureModel;
    private final String oldName;
    private final String newName;

    public FeatureRename(IFeatureModel featureModel, String oldName, String newName) {
        this.featureModel = featureModel;
        if (!StringUtils.isPresent(newName))
            throw new RuntimeException("no new feature name given");
        this.oldName = oldName;
        this.newName = newName;
        FeatureUtils.requireFeature(featureModel, oldName);
    }

    protected void _apply() {
        if (!featureModel.getRenamingsManager().renameFeature(oldName, newName))
            throw new RuntimeException("invalid renaming operation");
    }

    protected void _undo() {
        if (!featureModel.getRenamingsManager().renameFeature(newName, oldName))
            throw new RuntimeException("invalid renaming operation");
    }
}
