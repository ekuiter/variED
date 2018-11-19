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

    public FeatureRename(IFeatureModel featureModel, String oldName, String newName) throws InvalidOperationException {
        this.featureModel = featureModel;
        if (!StringUtils.isPresent(newName))
            throw new IllegalArgumentException("no new feature name given");
        this.oldName = oldName;
        this.newName = newName;
        FeatureUtils.requireFeature(featureModel, oldName);
    }

    protected void _apply() throws InvalidOperationException {
        if (!featureModel.getRenamingsManager().renameFeature(oldName, newName))
            throw new InvalidOperationException("invalid renaming operation");
    }

    protected void _undo() throws InvalidOperationException {
        if (!featureModel.getRenamingsManager().renameFeature(newName, oldName))
            throw new InvalidOperationException("invalid renaming operation");
    }
}
