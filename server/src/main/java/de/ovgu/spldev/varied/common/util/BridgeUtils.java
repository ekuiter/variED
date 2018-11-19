package de.ovgu.spldev.varied.common.util;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.IFeatureStructure;
import de.ovgu.featureide.fm.core.base.impl.FMFactoryManager;
import de.ovgu.spldev.varied.common.operations.Operation;
import jsweet.util.Lang;
import org.pmw.tinylog.Logger;

import java.util.HashSet;
import java.util.Iterator;
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
        IFeature feature;
        try {
            feature = Lang.$insert("featureModel.createFeature(name)");
        } catch (UnsatisfiedLinkError e) {
            feature = FMFactoryManager.getFactory(featureModel).createFeature(featureModel, name);
        }
        return feature;
    }

    public static <T> Iterator<T> descendingIterator(LinkedList<T> list) {
        Iterator<T> iterator;
        try {
            // JavaScript implementation of a descending iterator
            iterator = Lang.$insert("(() => {let i = list.length - 1; return {next: () => i >= 0 ? list[i--] : null, hasNext: () => i >= 0};})()");
        } catch (UnsatisfiedLinkError e) {
            iterator = list.descendingIterator();
        }
        return iterator;
    }

    public static Set<String> getFeatureNames(IFeatureModel featureModel) {
        HashSet<String> featureNames = new HashSet<>();
        for (IFeature feature : featureModel.getFeatures())
            featureNames.add(feature.getName());
        return featureNames;
    }

    public static List<String> getFeatureNames(List<IFeature> features) {
        LinkedList<String> featureNames = new LinkedList<>();
        for (IFeature feature : features)
            featureNames.add(feature.getName());
        return featureNames;
    }

    public static List<IFeature> convertToFeatureList(List<IFeatureStructure> featureStructures) {
        List<IFeature> featureList = new LinkedList<>();
        for (IFeatureStructure featureStructure : featureStructures)
            featureList.add(featureStructure.getFeature());
        return featureList;
    }

    public static List<IFeatureStructure> convertToFeatureStructureList(List<IFeature> features) {
        List<IFeatureStructure> featureStructureList = new LinkedList<>();
        for (IFeature feature : features)
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

    public static void log(String message) {
        try {
            Lang.$insert("(() => {if (!window.app.logger) console.warn('logger not accessible from BridgeUtils'); else window.app.logger.infoTagged({tag: 'bridge'}, () => message);})()");
        } catch (UnsatisfiedLinkError e) {
            Logger.debug(message);
        }
    }

    public static String toString(Operation operation) {
        try {
            return Lang.$insert("operation.constructor.name");
        } catch (UnsatisfiedLinkError e) {
            return operation.toString();
        }
    }
}
