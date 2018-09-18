package de.ovgu.spldev.varied.util;

import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.impl.FMFormatManager;
import de.ovgu.featureide.fm.core.io.IPersistentFormat;
import de.ovgu.featureide.fm.core.io.manager.FeatureModelManager;
import de.ovgu.spldev.varied.StateContext;
import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;

public class FeatureModelUtils {
    public static IFeatureModel loadFeatureModel(String source, String fileName) {
        IPersistentFormat format = FMFormatManager.getInstance().getFormatByContent(source, fileName);
        if (format == null)
            throw new RuntimeException("feature model format not recognized");
        IFeatureModel featureModel = FeatureModelManager.load(source, fileName);
        if (featureModel == null)
            throw new RuntimeException("feature model could not be loaded");
        return featureModel;
    }

    public static Message.IEncodable[] toMessage(StateContext.FeatureModel stateContext) {
        return new Message.IEncodable[]{new Api.FeatureDiagramFeatureModel(stateContext.getArtifactPath(), stateContext.getFeatureModel())};
    }
}
