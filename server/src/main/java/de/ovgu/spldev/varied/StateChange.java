package de.ovgu.spldev.varied;

import de.ovgu.featureide.fm.core.base.FeatureUtils;
import de.ovgu.featureide.fm.core.base.*;
import de.ovgu.featureide.fm.core.base.impl.FMFactoryManager;
import de.ovgu.featureide.fm.core.functional.Functional;

import java.util.Collections;
import java.util.HashMap;
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

    // adapted from CreateFeatureAboveOperation
    public static class FeatureAddAbove extends FeatureModelStateChange {
        private IFeature newCompound;
        private IFeature child;
        private LinkedList<IFeature> selectedFeatures;
        private HashMap<IFeature, Integer> children = new HashMap<>();
        private boolean parentOr = false;
        private boolean parentAlternative = false;

        public FeatureAddAbove(IFeatureModel featureModel, LinkedList<IFeature> selectedFeatures) {
            super(featureModel);
            this.selectedFeatures = selectedFeatures;
            if (selectedFeatures.size() == 0)
                throw new RuntimeException("no features given");
            child = selectedFeatures.get(0);
            int number = 0;
            while (FeatureUtils.getFeatureNames(featureModel).contains(DEFAULT_FEATURE_LAYER_CAPTION + ++number)) {}

            newCompound = FMFactoryManager.getFactory(featureModel).createFeature(featureModel, DEFAULT_FEATURE_LAYER_CAPTION + number);
        }

        public Message apply() {
            final IFeatureStructure parent = child.getStructure().getParent();
            if (parent != null) {
                parentOr = parent.isOr();
                parentAlternative = parent.isAlternative();

                newCompound.getStructure().setMultiple(parent.isMultiple());
                final int index = parent.getChildIndex(child.getStructure());
                for (final IFeature iFeature : selectedFeatures) {
                    int iFeatureIndex = parent.getChildIndex(iFeature.getStructure());
                    if (iFeatureIndex == -1)
                        throw new RuntimeException("the given features must be adjacent");
                    children.put(iFeature, iFeatureIndex);
                }
                for (final IFeature iFeature : selectedFeatures) {
                    parent.removeChild(iFeature.getStructure());
                }
                parent.addChildAtPosition(index, newCompound.getStructure());
                for (final IFeature iFeature : selectedFeatures) {
                    newCompound.getStructure().addChild(iFeature.getStructure());
                }

                if (parentOr) {
                    newCompound.getStructure().changeToOr();
                } else if (parentAlternative) {
                    newCompound.getStructure().changeToAlternative();
                } else {
                    newCompound.getStructure().changeToAnd();
                }
                parent.changeToAnd();
                featureModel.addFeature(newCompound);
            } else {
                newCompound.getStructure().addChild(child.getStructure());
                featureModel.addFeature(newCompound);
                featureModel.getStructure().setRoot(newCompound.getStructure());
            }

            return new Message.FeatureModel(featureModel);
        }

        public Message undo() {
            final IFeatureStructure parent = newCompound.getStructure().getParent();
            if (parent != null) {
                newCompound.getStructure().setChildren(Collections.<IFeatureStructure> emptyList());
                featureModel.deleteFeature(newCompound);
                for (final IFeature iFeature : children.keySet()) {
                    parent.addChildAtPosition(children.get(iFeature), iFeature.getStructure());
                }

                if (parentOr) {
                    parent.changeToOr();
                } else if (parentAlternative) {
                    parent.changeToAlternative();
                } else {
                    parent.changeToAnd();
                }
            } else {
                featureModel.getStructure().replaceRoot(child.getStructure());
            }

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
