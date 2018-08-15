package de.ovgu.spldev.varied;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.IFeatureModelFactory;
import de.ovgu.featureide.fm.core.base.IFeatureStructure;
import de.ovgu.featureide.fm.core.base.impl.DefaultFeatureModelFactory;
import de.ovgu.featureide.fm.core.base.impl.FeatureStructure;
import de.ovgu.featureide.fm.core.io.manager.FeatureModelManager;

import java.nio.file.Paths;
import java.util.Objects;

public class StateContext {
    private IFeatureModel featureModel;
    private StateChangeStack stateChangeStack = new StateChangeStack();

    static IFeatureModel model;
    static {
        IFeatureModelFactory FACTORY = DefaultFeatureModelFactory.getInstance();
        model = FACTORY.createFeatureModel();
        final IFeature featureA = FACTORY.createFeature(model, "A");
        model.addFeature(featureA);
        model.getStructure().setRoot(featureA.getStructure());

        final IFeature featureB = FACTORY.createFeature(model, "B");
        model.addFeature(featureB);

        featureA.getStructure().addChild(featureB.getStructure());
    }
    public static StateContext DEFAULT = new StateContext(model);
    //FeatureModelManager.load(Paths.get("/Users/ek/model.xml")).getObject()

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
