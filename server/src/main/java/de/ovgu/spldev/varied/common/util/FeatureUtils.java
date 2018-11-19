package de.ovgu.spldev.varied.common.util;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.IFeatureStructure;
import de.ovgu.spldev.varied.common.operations.Operation;

import java.util.LinkedList;

public class FeatureUtils {
    public static IFeature requireFeature(IFeatureModel featureModel, String feature) throws Operation.InvalidOperationException {
        if (!StringUtils.isPresent(feature))
            throw new IllegalArgumentException("no feature given");
        IFeature _feature = featureModel.getFeature(feature);
        if (_feature == null)
            throw new Operation.InvalidOperationException("invalid feature \"" + feature + "\"");
        return _feature;
    }

    public static LinkedList<IFeature> requireFeatures(IFeatureModel featureModel, String[] features) throws Operation.InvalidOperationException {
        LinkedList<IFeature> _features = new LinkedList<>();
        for (String feature : features)
            _features.add(FeatureUtils.requireFeature(featureModel, feature));
        return _features;
    }

    public static LinkedList<IFeature> requireSiblingFeatures(IFeatureModel featureModel, String[] features) throws Operation.InvalidOperationException {
        if (features.length == 0)
            return new LinkedList<>();
        LinkedList<IFeature> _features = requireFeatures(featureModel, features);
        IFeatureStructure parent = _features.get(0).getStructure().getParent();
        for (IFeature feature : _features)
            if (feature.getStructure().getParent() != parent)
                throw new Operation.InvalidOperationException("the given features are not adjacent");
        return _features;
    }

    public static void sortSiblingFeatures(LinkedList<IFeature> features) {
        features.sort((o1, o2) -> {
            IFeatureStructure s1 = o1.getStructure(), s2 = o2.getStructure();
            return Integer.compare(s1.getParent().getChildIndex(s1), s2.getParent().getChildIndex(s2));
        });
    }

}
