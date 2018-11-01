package de.ovgu.spldev.varied.common.util;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.impl.FMFactoryManager;
import jsweet.lang.Erased;
import jsweet.util.Lang;

// Bridge as in: running the same code on the server and the client.
public class BridgeUtils {
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
}
