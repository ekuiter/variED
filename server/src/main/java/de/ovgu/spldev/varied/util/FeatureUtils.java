package de.ovgu.spldev.varied.util;

import de.ovgu.featureide.fm.core.base.IConstraint;
import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IPropertyContainer;

import java.util.UUID;

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

    public static void removeFeatureName(IFeature feature) {
        feature.getCustomProperties().remove(FeatureUtils.NAME_PROPERTY);
    }

    public static UUID getConstraintID(IConstraint constraint) {
        try {
            return UUID.fromString(constraint.getName());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("no ID found for constraint " + constraint);
        }
    }

    public static void setConstraintID(IConstraint constraint, UUID id) {
        constraint.setName(id.toString());
    }

    public static void removeConstraintID(IConstraint constraint) {
        constraint.setName(null);
    }
}
