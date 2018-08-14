package de.ovgu.spldev.varied;

import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.io.manager.FeatureModelManager;

import java.nio.file.Paths;
import java.util.Objects;

public class StateContext {
    private IFeatureModel featureModel;
    private StateChangeStack stateChangeStack = new StateChangeStack();

    public static StateContext DEFAULT = new StateContext(FeatureModelManager.load(Paths.get("/Users/ek/model.xml")).getObject());

    public StateContext(IFeatureModel featureModel) {
        this.featureModel = Objects.requireNonNull(featureModel, "no feature model given");
    }

    public IFeatureModel getFeatureModel() {
        return featureModel;
    }

    public StateChangeStack getStateChangeStack() {
        return stateChangeStack;
    }

    public void sendInitialState(Endpoint endpoint) {
        endpoint.send(new Message.FeatureModel(featureModel));
    }
}
