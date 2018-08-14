package de.ovgu.spldev.varied;

import de.ovgu.featureide.fm.core.base.FeatureUtils;
import de.ovgu.featureide.fm.core.base.IConstraint;
import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.impl.FMFactoryManager;
import de.ovgu.featureide.fm.core.functional.Functional;

import java.util.LinkedList;

import static de.ovgu.featureide.fm.core.localization.StringTable.DEFAULT_FEATURE_LAYER_CAPTION;

public abstract class StateChange {
    public abstract Message apply();
    public abstract Message undo();

    public static abstract class FeatureModelStateChange extends StateChange {
        protected IFeatureModel featureModel;

        public FeatureModelStateChange(IFeatureModel featureModel) {
            this.featureModel = featureModel;
        }
    }

    // adapted from CreateFeatureBelowOperation
    public static class FeatureAdd extends FeatureModelStateChange {
        private IFeature feature;
        private IFeature newFeature;

        public FeatureAdd(IFeature feature, IFeatureModel featureModel) {
            super(featureModel);
            this.feature = feature;
        }

        public Message apply() {
            int number = 1;

            while (FeatureUtils.getFeatureNames(featureModel).contains(DEFAULT_FEATURE_LAYER_CAPTION + number)) {
                number++;
            }

            newFeature = FMFactoryManager.getFactory(featureModel).createFeature(featureModel, DEFAULT_FEATURE_LAYER_CAPTION + number);
            featureModel.addFeature(newFeature);
            feature = featureModel.getFeature(feature.getName());
            feature.getStructure().addChild(newFeature.getStructure());

            return new Message.FeatureModel(featureModel);
        }

        public Message undo() {
            newFeature = featureModel.getFeature(newFeature.getName());
            featureModel.deleteFeature(newFeature);
            return new Message.FeatureModel(featureModel);
        }
    }

    // adapted from DeleteFeatureOperation
    public static class FeatureDelete extends FeatureModelStateChange {
        private IFeature feature;
        private IFeature oldParent;
        private int oldIndex;
        private LinkedList<IFeature> oldChildren;
        private boolean deleted = false;
        private boolean or = false;
        private boolean alternative = false;
        private final IFeature replacement;

        public FeatureDelete(IFeatureModel featureModel, IFeature feature) {
            super(featureModel);
            this.feature = feature;
            replacement = null;
        }

        public FeatureDelete(IFeatureModel featureModel, IFeature feature, IFeature replacement) {
            super(featureModel);
            this.feature = feature;
            this.replacement = replacement;
        }

        public Message apply() {
            feature = featureModel.getFeature(feature.getName());
            oldParent = FeatureUtils.getParent(feature);
            if (oldParent != null) {
                oldIndex = oldParent.getStructure().getChildIndex(feature.getStructure());
                or = oldParent.getStructure().isOr();
                alternative = oldParent.getStructure().isAlternative();
            }
            oldChildren = new LinkedList<IFeature>();
            oldChildren.addAll(Functional.toList(FeatureUtils.convertToFeatureList(feature.getStructure().getChildren())));

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

            return new Message.FeatureModel(featureModel);
        }

        public Message undo() {
            try {
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

                feature.getStructure().setChildren(Functional.toList(FeatureUtils.convertToFeatureStructureList(oldChildren)));
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

            } catch (final Exception e) {
                e.printStackTrace();
            }

            return new Message.FeatureModel(featureModel);
        }
    }

    // adapted from RenameFeatureOperation
    public static class FeatureNameChanged extends FeatureModelStateChange {
        private final String oldName;
        private final String newName;

        public FeatureNameChanged(IFeatureModel featureModel, String oldName, String newName) {
            super(featureModel);
            this.oldName = oldName;
            this.newName = newName;
        }

        public Message apply() {
            if (!featureModel.getRenamingsManager().renameFeature(oldName, newName))
                throw new RuntimeException("invalid renaming operation");
            return new Message.FeatureModel(featureModel);
        }

        public Message undo() {
            if (!featureModel.getRenamingsManager().renameFeature(newName, oldName))
                throw new RuntimeException("invalid renaming operation");
            return new Message.FeatureModel(featureModel);
        }
    }
}
