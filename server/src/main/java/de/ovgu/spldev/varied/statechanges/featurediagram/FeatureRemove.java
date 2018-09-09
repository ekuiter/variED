package de.ovgu.spldev.varied.statechanges.featurediagram;

import de.ovgu.featureide.fm.core.base.IConstraint;
import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.functional.Functional;
import de.ovgu.spldev.varied.FeatureModelUtils;
import de.ovgu.spldev.varied.FeatureUtils;
import de.ovgu.spldev.varied.Message;
import de.ovgu.spldev.varied.statechanges.StateChange;

import java.util.LinkedList;

// adapted from DeleteFeatureOperation
public class FeatureRemove extends StateChange {
    private IFeatureModel featureModel;
    private IFeature feature;
    private IFeature oldParent;
    private int oldIndex;
    private LinkedList<IFeature> oldChildren;
    private boolean deleted = false;
    private boolean or = false;
    private boolean alternative = false;
    private final IFeature replacement;

    public FeatureRemove(IFeatureModel featureModel, String feature) {
        this(featureModel, FeatureUtils.requireFeature(featureModel, feature));
    }

    FeatureRemove(IFeatureModel featureModel, IFeature feature) {
        this.featureModel = featureModel;
        this.feature = feature;
        if (this.feature.getStructure().isRoot() && this.feature.getStructure().getChildren().size() != 1)
            throw new RuntimeException("can only delete root feature when it has exactly one child");
        replacement = null;
    }

    public FeatureRemove(IFeatureModel featureModel, IFeature feature, IFeature replacement) {
        this.featureModel = featureModel;
        this.feature = feature;
        this.replacement = replacement;
    }

    public Message.IEncodable[] _apply() {
        feature = featureModel.getFeature(feature.getName());
        oldParent = de.ovgu.featureide.fm.core.base.FeatureUtils.getParent(feature);
        if (oldParent != null) {
            oldIndex = oldParent.getStructure().getChildIndex(feature.getStructure());
            or = oldParent.getStructure().isOr();
            alternative = oldParent.getStructure().isAlternative();
        }
        oldChildren = new LinkedList<>();
        oldChildren.addAll(Functional.toList(de.ovgu.featureide.fm.core.base.FeatureUtils.convertToFeatureList(feature.getStructure().getChildren())));

        if (oldParent != null) {
            oldParent = featureModel.getFeature(oldParent.getName());
        }
        final LinkedList<IFeature> oldChildrenCopy = new LinkedList<IFeature>();

        for (final IFeature f : oldChildren) {
            if (!f.getName().equals(feature.getName())) {
                final IFeature oldChild = featureModel.getFeature(f.getName());
                oldChildrenCopy.add(oldChild);
            }
        }

        oldChildren = oldChildrenCopy;
        if (feature.getStructure().isRoot()) {
            featureModel.getStructure().replaceRoot(featureModel.getStructure().getRoot().removeLastChild());
            deleted = true;
        } else {
            deleted = featureModel.deleteFeature(feature);
        }

        // Replace feature name in constraints
        if (replacement != null) {
            for (final IConstraint c : featureModel.getConstraints()) {
                if (c.getContainedFeatures().contains(feature)) {
                    c.getNode().replaceFeature(feature, replacement);
                }
            }
        }

        // make sure after delete the group type of the parent is set to and if there is only one child left
        if (oldParent != null) {
            if (oldParent.getStructure().getChildrenCount() == 1) {
                oldParent.getStructure().changeToAnd();
            }
        }

        return FeatureModelUtils.toMessage(featureModel);
    }

    public Message.IEncodable[] _undo() {
        if (!deleted) {
            return null;
        }

        if (oldParent != null) {
            oldParent = featureModel.getFeature(oldParent.getName());
        }
        final LinkedList<IFeature> oldChildrenCopy = new LinkedList<IFeature>();

        for (final IFeature f : oldChildren) {
            if (!f.getName().equals(feature.getName())) {
                final IFeature child = featureModel.getFeature(f.getName());
                if ((child != null) && (child.getStructure().getParent() != null)) {
                    child.getStructure().getParent().removeChild(child.getStructure());
                }
                oldChildrenCopy.add(child);
            }
        }

        oldChildren = oldChildrenCopy;

        feature.getStructure().setChildren(Functional.toList(de.ovgu.featureide.fm.core.base.FeatureUtils.convertToFeatureStructureList(oldChildren)));
        if (oldParent != null) {
            oldParent.getStructure().addChildAtPosition(oldIndex, feature.getStructure());
        } else {
            featureModel.getStructure().setRoot(feature.getStructure());
        }
        featureModel.addFeature(feature);

        // Replace feature name in Constraints
        if (replacement != null) {
            for (final IConstraint c : featureModel.getConstraints()) {
                if (c.getContainedFeatures().contains(replacement)) {
                    c.getNode().replaceFeature(replacement, feature);
                }
            }
        }

        // When deleting a child and leaving one child behind the group type will be changed to and. reverse to old group type
        if ((oldParent != null) && or) {
            oldParent.getStructure().changeToOr();
        } else if ((oldParent != null) && alternative) {
            oldParent.getStructure().changeToAlternative();
        }

        return FeatureModelUtils.toMessage(featureModel);
    }
}
