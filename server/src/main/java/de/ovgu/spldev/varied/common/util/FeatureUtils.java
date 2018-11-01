package de.ovgu.spldev.varied.common.util;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.IFeatureStructure;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.Set;
import java.util.stream.Stream;

public class FeatureUtils {
    public static IFeature requireFeature(IFeatureModel featureModel, String feature) {
        if (!StringUtils.isPresent(feature))
            throw new RuntimeException("no feature given");
        IFeature _feature = featureModel.getFeature(feature);
        if (_feature == null)
            throw new RuntimeException("invalid feature \"" + feature + "\"");
        return _feature;
    }

    public static LinkedList<IFeature> requireFeatures(IFeatureModel featureModel, String[] features) {
        LinkedList<IFeature> _features = new LinkedList<>();
        for (String feature : features)
            _features.add(FeatureUtils.requireFeature(featureModel, feature));
        return _features;
    }

    public static boolean requireSiblings(IFeatureModel featureModel, String[] features) {
        if (features.length == 0)
            return true;
        IFeatureStructure parent = featureModel.getFeature(features[0]).getStructure().getParent();
        for (String feature : features)
            if (featureModel.getFeature(feature).getStructure().getParent() != parent)
                throw new RuntimeException("the given features are not adjacent");
        return true;
    }

    public static void sortSiblingFeatures(LinkedList<IFeature> features) {
        features.sort((o1, o2) -> {
            IFeatureStructure s1 = o1.getStructure(), s2 = o2.getStructure();
            return Integer.compare(s1.getParent().getChildIndex(s1), s2.getParent().getChildIndex(s2));
        });
    }

    public static Set<String> getFeatureNames(IFeatureModel featureModel) {
        HashSet<String> featureNames = new HashSet<>();
        for (IFeature feature : featureModel.getFeatures())
            featureNames.add(feature.getName());
        return featureNames;
    }
}
