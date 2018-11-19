package de.ovgu.spldev.varied.util;

import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.impl.FMFormatManager;
import de.ovgu.featureide.fm.core.io.IPersistentFormat;
import de.ovgu.featureide.fm.core.io.manager.FeatureModelManager;
import de.ovgu.spldev.varied.StateContext;
import de.ovgu.spldev.varied.common.util.FeatureUtils;
import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;
import org.pmw.tinylog.Logger;

import java.nio.file.Path;
import java.util.UUID;

public class FeatureModelUtils {
    private static void renameFeaturesToFeatureUUIDs(IFeatureModel featureModel) {
        de.ovgu.featureide.fm.core.base.FeatureUtils.getFeatureNames(featureModel).forEach(featureName -> {
            FeatureUtils.setFeatureName(featureModel.getFeature(featureName), featureName);
            if (!featureModel.getRenamingsManager().renameFeature(featureName, UUID.randomUUID().toString()))
                throw new RuntimeException("could not rename feature " + featureName + " to UUID");
        });
    }

    public static IFeatureModel loadFeatureModel(Path path) {
        Logger.debug("loading feature model from {}", path);
        IFeatureModel featureModel = FeatureModelManager.load(path).getObject();
        if (featureModel == null)
            throw new RuntimeException("no valid feature model found at path " + path);
        renameFeaturesToFeatureUUIDs(featureModel);
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
        renameFeaturesToFeatureUUIDs(featureModel);
        return featureModel;
    }

    public static Message.IEncodable[] toMessage(StateContext.FeatureModel stateContext) {
        return new Message.IEncodable[]{new Api.FeatureDiagramFeatureModel(stateContext.getArtifactPath(), stateContext.getFeatureModel())};
    }
}
