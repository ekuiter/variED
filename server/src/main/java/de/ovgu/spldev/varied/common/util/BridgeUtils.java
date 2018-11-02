package de.ovgu.spldev.varied.common.util;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.IFeatureStructure;
import de.ovgu.featureide.fm.core.base.impl.FMFactoryManager;
import jsweet.lang.Erased;
import jsweet.util.Lang;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

// Bridge as in: running the same code on the server and the client.
// This class also reimplements some helper methods from FeatureIDE.
public class BridgeUtils {
    public static final String DEFAULT_FEATURE_LAYER_CAPTION = "NewFeature";

    public static IFeature createFeature(IFeatureModel featureModel, String name) {
        // Some trickery to make this work on the server (using FMFactoryManager)
        // as well as on the client (custom createFeature method).
        IFeature feature = _createFeature(featureModel, name);
        try {
            feature = Lang.$insert("featureModel.createFeature(name);");
        } catch (UnsatisfiedLinkError e) {
        }
        return feature;
    }

    @Erased
    private static IFeature _createFeature(IFeatureModel featureModel, String name) {
        return FMFactoryManager.getFactory(featureModel).createFeature(featureModel, name);
    }

    public static Set<String> getFeatureNames(IFeatureModel featureModel) {
        HashSet<String> featureNames = new HashSet<>();
        for (IFeature feature : featureModel.getFeatures())
            featureNames.add(feature.getName());
        return featureNames;
    }

    public static List<IFeature> convertToFeatureList(List<IFeatureStructure> list) {
        List<IFeature> featureList = new LinkedList<>();
        for (IFeatureStructure featureStructure : list)
            featureList.add(featureStructure.getFeature());
        return featureList;
    }

    public static List<IFeatureStructure> convertToFeatureStructureList(List<IFeature> list) {
        List<IFeatureStructure> featureStructureList = new LinkedList<>();
        for (IFeature feature : list)
            featureStructureList.add(feature.getStructure());
        return featureStructureList;
    }

    public static IFeature getParent(IFeature feature) {
        if (feature != null) {
            final IFeatureStructure parent = feature.getStructure().getParent();
            if (parent != null) {
                return parent.getFeature();
            }
        }
        return null;
    }

    // Objects.equals
    public static boolean equals(Object a, Object b) {
        return (a == b) || (a != null && a.equals(b));
    }
}
