package de.ovgu.spldev.varied;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.IFeatureStructure;
import de.ovgu.featureide.fm.core.base.impl.FMFormatManager;
import de.ovgu.featureide.fm.core.io.IPersistentFormat;
import de.ovgu.featureide.fm.core.io.manager.FeatureModelManager;

import java.util.LinkedList;
import java.util.stream.Stream;

public class FeatureUtils {
    public static boolean requireFeature(IFeatureModel featureModel, String feature) {
        if (!StringUtils.isPresent(feature))
            throw new RuntimeException("no feature given");
        if (featureModel.getFeature(feature) == null)
            throw new RuntimeException("invalid feature \"" + feature + "\"");
        return true;
    }

    public static boolean requireFeatures(IFeatureModel featureModel, String[] features) {
        for (String feature : features)
            FeatureUtils.requireFeature(featureModel, feature);
        return true;
    }

    public static boolean requireSiblings(IFeatureModel featureModel, String[] features) {
        if (Stream.of(features)
                .map(feature -> featureModel.getFeature(feature).getStructure().getParent())
                .distinct().count() > 1)
            throw new RuntimeException("the given features are not adjacent");
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

    public static void sortSiblingFeatures(LinkedList<IFeature> features) {
        features.sort((o1, o2) -> {
            IFeatureStructure s1 = o1.getStructure(), s2 = o2.getStructure();
            return Integer.compare(s1.getParent().getChildIndex(s1), s2.getParent().getChildIndex(s2));
        });
    }
}
