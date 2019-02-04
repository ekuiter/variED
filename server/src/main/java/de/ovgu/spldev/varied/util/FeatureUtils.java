package de.ovgu.spldev.varied.util;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.IFeatureStructure;
import de.ovgu.featureide.fm.core.base.IPropertyContainer;
import de.ovgu.spldev.varied.common.operations.Operation;

import java.util.LinkedList;

public class FeatureUtils {
    public static String NAME_PROPERTY = "variED_name";

    public static String getFeatureName(IFeature feature) {
        if (feature.getCustomProperties().has(NAME_PROPERTY))
            return feature.getCustomProperties().get(NAME_PROPERTY);
        else
            throw new RuntimeException("no name found for feature " + feature);
    }

    public static void setFeatureName(IFeature feature, String name) {
        feature.getCustomProperties().set(FeatureUtils.NAME_PROPERTY, IPropertyContainer.Type.STRING, name);
    }
}
