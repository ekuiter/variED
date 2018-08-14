package de.ovgu.spldev.varied;

import de.ovgu.featureide.fm.core.base.IFeatureModel;

public class FeatureUtils {
    public static boolean requireFeature(IFeatureModel featureModel, String feature) {
        if (!StringUtils.isPresent(feature))
            throw new RuntimeException("no feature given");
        if (featureModel.getFeature(feature) == null)
            throw new RuntimeException("invalid feature \"" + feature + "\"");
        return true;
    }
}
