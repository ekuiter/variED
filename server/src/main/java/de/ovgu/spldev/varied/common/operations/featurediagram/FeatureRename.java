package de.ovgu.spldev.varied.common.operations.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.common.operations.Operation;
import de.ovgu.spldev.varied.common.util.FeatureUtils;
import de.ovgu.spldev.varied.common.util.StringUtils;

// adapted from RenameFeatureOperation
public class FeatureRename extends Operation {
    private IFeature feature;
    private String oldName, name;

    public FeatureRename(IFeatureModel featureModel, String featureUUID, String name) throws InvalidOperationException {
        this.feature = FeatureUtils.requireFeature(featureModel, featureUUID);
        this.oldName = FeatureUtils.getFeatureName(this.feature);
        this.name = name;
        if (!StringUtils.isPresent(name))
            throw new IllegalArgumentException("no new feature name given");
    }

    protected void _apply() {
        FeatureUtils.setFeatureName(feature, name); // TODO: ensure name uniqueness
    }

    protected void _undo() {
        FeatureUtils.setFeatureName(feature, oldName);
    }
}
