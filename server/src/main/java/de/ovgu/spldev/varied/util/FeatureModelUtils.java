package de.ovgu.spldev.varied.util;

import de.ovgu.featureide.fm.core.ExtensionManager;
import de.ovgu.featureide.fm.core.PluginID;
import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.impl.FMFormatManager;
import de.ovgu.featureide.fm.core.io.IFeatureModelFormat;
import de.ovgu.featureide.fm.core.io.IPersistentFormat;
import de.ovgu.featureide.fm.core.io.manager.FeatureModelManager;
import org.pmw.tinylog.Logger;

import java.nio.file.Path;
import java.util.UUID;

public class FeatureModelUtils {
    private static void renameFeaturesToFeatureIDs(IFeatureModel featureModel) {
        de.ovgu.featureide.fm.core.base.FeatureUtils.getFeatureNames(featureModel).forEach(featureName -> {
            FeatureUtils.setFeatureName(featureModel.getFeature(featureName), featureName);
            if (!featureModel.getRenamingsManager().renameFeature(featureName, UUID.randomUUID().toString()))
                throw new RuntimeException("could not rename feature " + featureName + " to ID");
        });
        featureModel.getConstraints().forEach(constraint ->
                FeatureUtils.setConstraintID(constraint, UUID.randomUUID()));
    }

    private static void renameFeatureIDsToFeatures(IFeatureModel featureModel) {
        de.ovgu.featureide.fm.core.base.FeatureUtils.getFeatureNames(featureModel).forEach(featureID -> {
            IFeature feature = featureModel.getFeature(featureID);
            String featureName = FeatureUtils.getFeatureName(feature);
            if (!featureModel.getRenamingsManager().renameFeature(featureID, featureName))
                throw new RuntimeException("could not rename feature " + featureID + " to " + featureName);
            FeatureUtils.removeFeatureName(feature);
        });
        featureModel.getConstraints().forEach(FeatureUtils::removeConstraintID);
    }

    public static IFeatureModel loadFeatureModel(Path path) {
        Logger.debug("loading feature model from {}", path);
        IFeatureModel featureModel = FeatureModelManager.load(path).getObject();
        if (featureModel == null)
            throw new RuntimeException("no valid feature model found at path " + path);
        renameFeaturesToFeatureIDs(featureModel);
        return featureModel;
    }

    public static IFeatureModel loadFeatureModel(String source, String fileName) {
        Logger.debug("loading feature model from a string");
        IPersistentFormat format = FMFormatManager.getInstance().getFormatByContent(source, fileName);
        if (format == null)
            throw new RuntimeException("feature model format not recognized");
        IFeatureModel featureModel = FeatureModelManager.load(source, fileName);
        if (featureModel == null)
            throw new RuntimeException("feature model could not be loaded");
        renameFeaturesToFeatureIDs(featureModel);
        return featureModel;
    }

    public static String serializeFeatureModel(IFeatureModel featureModel, String formatName) {
        Logger.debug("serializing feature model with format {}", formatName);
        if (featureModel == null)
            throw new RuntimeException("no feature model given");
        featureModel = featureModel.clone();
        renameFeatureIDsToFeatures(featureModel);
        IFeatureModelFormat format;
        try {
            format = FMFormatManager.getInstance().getFormatById(PluginID.PLUGIN_ID + ".format.fm." + formatName);
        } catch (ExtensionManager.NoSuchExtensionException e) {
            throw new RuntimeException("invalid feature model format given");
        }
        return format.write(featureModel);
    }

    public static String serializeFeatureModel(IFeatureModel featureModel) {
        return serializeFeatureModel(featureModel, "XmlFeatureModelFormat");
    }
}
