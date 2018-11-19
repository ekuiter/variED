package de.ovgu.spldev.varied.common.operations.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.common.operations.Operation;
import de.ovgu.spldev.varied.common.util.BridgeUtils;
import de.ovgu.spldev.varied.common.util.FeatureUtils;
import de.ovgu.spldev.varied.common.util.StringUtils;

public class FeatureSetDescription extends Operation {
    private IFeature feature;
    private String oldDescription, description;

    public FeatureSetDescription(IFeatureModel featureModel, String featureUUID, String description) throws InvalidOperationException {
        this.feature = FeatureUtils.requireFeature(featureModel, featureUUID);
        this.oldDescription = this.feature.getProperty().getDescription();
        this.description = description;
        if (!StringUtils.isPresent(description) && !BridgeUtils.equals(description, ""))
            throw new IllegalArgumentException("no description given");
    }

    protected void _apply() {
        feature.getProperty().setDescription(description);
    }

    protected void _undo() {
        feature.getProperty().setDescription(oldDescription);
    }
}
