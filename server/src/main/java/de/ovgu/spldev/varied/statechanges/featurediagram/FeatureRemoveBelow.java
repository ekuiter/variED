package de.ovgu.spldev.varied.statechanges.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.IFeatureModelElement;
import de.ovgu.spldev.varied.StateContext;
import de.ovgu.spldev.varied.util.FeatureModelUtils;
import de.ovgu.spldev.varied.util.FeatureUtils;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.statechanges.BatchStateChange;

import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

// adapted from FeatureTreeDeleteOperation
public class FeatureRemoveBelow extends BatchStateChange {
    private StateContext.FeatureModel stateContext;
    private LinkedList<IFeature> featureList = new LinkedList<>();
    private LinkedList<IFeature> containedFeatureList = new LinkedList<>();
    private LinkedList<IFeature> andList = new LinkedList<>();
    private LinkedList<IFeature> orList = new LinkedList<>();
    private LinkedList<IFeature> alternativeList = new LinkedList<>();

    public FeatureRemoveBelow(StateContext.FeatureModel stateContext, String feature) {
        this(stateContext, feature, null);
    }

    public FeatureRemoveBelow(StateContext.FeatureModel stateContext, String feature, Object batchContext) {
        this.stateContext = stateContext;

        // do nothing if the feature has already been removed by another state change in a batch message
        if (stateContext.getFeatureModel().getFeature(feature) == null && batchContext != null &&
                ((LinkedList<String>) batchContext).contains(feature))
            return;

        IFeature _feature = FeatureUtils.requireFeature(stateContext.getFeatureModel(), feature);
        if (_feature.getStructure().isRoot())
            throw new RuntimeException("can not delete root feature and its children");
        final LinkedList<IFeature> list = new LinkedList<>();
        list.add(_feature);
        getFeaturesToDelete(list);

        if (containedFeatureList.isEmpty()) {
            for (final IFeature feat : featureList) {
                if (feat.getStructure().isAnd()) {
                    andList.add(feat);
                } else if (feat.getStructure().isOr()) {
                    orList.add(feat);
                } else if (feat.getStructure().isAlternative()) {
                    alternativeList.add(feat);
                }
                addStateChange(new FeatureRemove(stateContext, feat));
            }
        } else {
            final String containedFeatures = containedFeatureList.toString();
            throw new RuntimeException("can not delete following features which are contained in constraints: " +
                    containedFeatures.substring(1, containedFeatures.length() - 1));
        }
    }

    public static Object createBatchContext() {
        return new LinkedList<String>();
    }

    public Object nextBatchContext(Object batchContext) {
        LinkedList<String> featuresToDelete = (LinkedList<String>) batchContext;
        featuresToDelete.addAll(featureList.stream().map(IFeatureModelElement::getName).collect(Collectors.toList()));
        return featuresToDelete;
    }

    private void getFeaturesToDelete(List<IFeature> linkedList) {
        for (final IFeature feat : linkedList) {
            if (!feat.getStructure().getRelevantConstraints().isEmpty()) {
                containedFeatureList.add(feat);
            }
            if (feat.getStructure().hasChildren()) {
                getFeaturesToDelete(de.ovgu.featureide.fm.core.base.FeatureUtils.convertToFeatureList(feat.getStructure().getChildren()));
            }
            featureList.add(feat);
        }
    }

    public Message.IEncodable[] _apply() {
        super._apply();
        return FeatureModelUtils.toMessage(stateContext);
    }

    public Message.IEncodable[] _undo() {
        IFeatureModel featureModel = stateContext.getFeatureModel();
        super._undo();
        // Set the right group types for the features
        for (final IFeature ifeature : andList) {
            if (featureModel.getFeature(ifeature.getName()) != null) {
                featureModel.getFeature(ifeature.getName()).getStructure().changeToAnd();
            }
        }
        for (final IFeature ifeature : alternativeList) {
            if (featureModel.getFeature(ifeature.getName()) != null) {
                featureModel.getFeature(ifeature.getName()).getStructure().changeToAlternative();
            }
        }
        for (final IFeature ifeature : orList) {
            if (featureModel.getFeature(ifeature.getName()) != null) {
                featureModel.getFeature(ifeature.getName()).getStructure().changeToOr();
            }
        }
        return FeatureModelUtils.toMessage(stateContext);
    }
}
