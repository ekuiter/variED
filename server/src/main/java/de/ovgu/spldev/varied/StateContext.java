package de.ovgu.spldev.varied;

import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.messaging.Api;

import java.util.Objects;

public abstract class StateContext {
    protected Artifact.Path artifactPath;
    private OperationStack operationStack = new OperationStack();

    StateContext(Artifact.Path artifactPath) {
        this.artifactPath = artifactPath;
    }

    public Artifact.Path getArtifactPath() {
        return artifactPath;
    }

    public OperationStack getOperationStack() {
        return operationStack;
    }

    abstract void sendInitialState(User user);

    public static class FeatureModel extends StateContext {
        private IFeatureModel featureModel;

        FeatureModel(Artifact.Path artifactPath, IFeatureModel featureModel) {
            super(artifactPath);
            this.featureModel = Objects.requireNonNull(featureModel, "no feature model given");
        }

        public IFeatureModel getFeatureModel() {
            return featureModel;
        }

        public void sendInitialState(User user) {
            user.send(new Api.FeatureDiagramFeatureModel(artifactPath, featureModel));
        }
    }
}
