package de.ovgu.spldev.varied;

import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.impl.FMFormatManager;
import de.ovgu.featureide.fm.core.io.IPersistentFormat;
import de.ovgu.featureide.fm.core.io.manager.FeatureModelManager;

public class FeatureUtils {
    public static boolean requireFeature(IFeatureModel featureModel, String feature) {
        if (!StringUtils.isPresent(feature))
            throw new RuntimeException("no feature given");
        if (featureModel.getFeature(feature) == null)
            throw new RuntimeException("invalid feature \"" + feature + "\"");
        return true;
    }

    public static IFeatureModel loadFeatureModel(String source, String fileName) {
        IPersistentFormat format = FMFormatManager.getInstance().getFormatByContent(source, fileName);
        if (format == null)
            throw new RuntimeException("feature model format not recognized");
        IFeatureModel featureModel = FeatureModelManager.load(source, fileName);
        if (featureModel == null)
            throw new RuntimeException("feature model could not be loaded");
        return featureModel;
    }
}
