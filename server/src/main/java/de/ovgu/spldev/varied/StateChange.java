package de.ovgu.spldev.varied;

import de.ovgu.featureide.fm.core.base.FeatureUtils;
import de.ovgu.featureide.fm.core.base.*;
import de.ovgu.featureide.fm.core.base.impl.FMFactoryManager;
import de.ovgu.featureide.fm.core.functional.Functional;
import jdk.nashorn.tools.Shell;

import java.util.*;

import static de.ovgu.featureide.fm.core.localization.StringTable.DEFAULT_FEATURE_LAYER_CAPTION;

public abstract class StateChange {
    public abstract Message.IEncodable[] apply();

    public abstract Message.IEncodable[] undo();

    public static abstract class FeatureModelStateChange extends StateChange {
        protected IFeatureModel featureModel;

        public FeatureModelStateChange(IFeatureModel featureModel) {
            this.featureModel = featureModel;
        }
    }

    public static abstract class FeatureModelMultipleStateChange extends FeatureModelStateChange {
        private LinkedList<FeatureModelStateChange> stateChanges = new LinkedList<>();

        public FeatureModelMultipleStateChange(IFeatureModel featureModel) {
            super(featureModel);
        }

        public void addStateChange(FeatureModelStateChange stateChange) {
            stateChanges.add(stateChange);
        }

        public Message.IEncodable[] apply() {
            for (FeatureModelStateChange stateChange : stateChanges)
                stateChange.apply();
            return new Message.IEncodable[]{new Message.FeatureModel(featureModel)};
        }

        public Message.IEncodable[] undo() {
            for (final Iterator<FeatureModelStateChange> it = stateChanges.descendingIterator(); it.hasNext(); )
                it.next().undo();
            return new Message.IEncodable[]{new Message.FeatureModel(featureModel)};
        }
    }

    // adapted from MultiFeatureModelOperation
    public static class FeatureModelMultiple extends FeatureModelMultipleStateChange {
        public FeatureModelMultiple(StateContext stateContext, LinkedList<Message.IUndoable> messages) {
            super(stateContext.getFeatureModel());
            for (Message.IUndoable message : messages) {
                StateChange stateChange = message.getStateChange(stateContext);
                if (!(stateChange instanceof FeatureModelStateChange))
                    throw new RuntimeException("expected feature model state change, got type " +
                            stateChange.getClass().getName());
                addStateChange((FeatureModelStateChange) stateChange);
            }
        }
    }

    // adapted from CreateFeatureBelowOperation
    public static class FeatureAddBelow extends FeatureModelStateChange {
        private IFeature feature;
        private IFeature newFeature;

        public FeatureAddBelow(IFeature feature, IFeatureModel featureModel) {
            super(featureModel);
            this.feature = feature;
        }

        public Message.IEncodable[] apply() {
            int number = 1;

            while (FeatureUtils.getFeatureNames(featureModel).contains(DEFAULT_FEATURE_LAYER_CAPTION + number)) {
                number++;
            }

            newFeature = FMFactoryManager.getFactory(featureModel).createFeature(featureModel, DEFAULT_FEATURE_LAYER_CAPTION + number);
            featureModel.addFeature(newFeature);
            feature = featureModel.getFeature(feature.getName());
            feature.getStructure().addChild(newFeature.getStructure());

            return new Message.IEncodable[]{new Message.FeatureModel(featureModel)};
        }

        public Message.IEncodable[] undo() {
            newFeature = featureModel.getFeature(newFeature.getName());
            featureModel.deleteFeature(newFeature);
            return new Message.IEncodable[]{new Message.FeatureModel(featureModel)};
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
            child = selectedFeatures.get(0);
            int number = 0;
            while (FeatureUtils.getFeatureNames(featureModel).contains(DEFAULT_FEATURE_LAYER_CAPTION + ++number)) {
            }

            newCompound = FMFactoryManager.getFactory(featureModel).createFeature(featureModel, DEFAULT_FEATURE_LAYER_CAPTION + number);
        }

        public Message.IEncodable[] apply() {
            final IFeatureStructure parent = child.getStructure().getParent();
            if (parent != null) {
                parentOr = parent.isOr();
                parentAlternative = parent.isAlternative();

                newCompound.getStructure().setMultiple(parent.isMultiple());
                final int index = parent.getChildIndex(child.getStructure());
                for (final IFeature iFeature : selectedFeatures) {
                    children.put(iFeature, parent.getChildIndex(iFeature.getStructure()));
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

            return new Message.IEncodable[]{new Message.FeatureModel(featureModel)};
        }

        public Message.IEncodable[] undo() {
            // TODO: does not restore original position/order of features (relevant selectedFeatures.size() > 1)
            final IFeatureStructure parent = newCompound.getStructure().getParent();
            if (parent != null) {
                newCompound.getStructure().setChildren(Collections.emptyList());
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
                newCompound.getStructure().removeChild(child.getStructure());
            }

            return new Message.IEncodable[]{new Message.FeatureModel(featureModel)};
        }
    }

    // adapted from DeleteFeatureOperation
    public static class FeatureRemove extends FeatureModelStateChange {
        private IFeature feature;
        private IFeature oldParent;
        private int oldIndex;
        private LinkedList<IFeature> oldChildren;
        private boolean deleted = false;
        private boolean or = false;
        private boolean alternative = false;
        private final IFeature replacement;

        public FeatureRemove(IFeatureModel featureModel, IFeature feature) {
            super(featureModel);
            this.feature = feature;
            replacement = null;
        }

        public FeatureRemove(IFeatureModel featureModel, IFeature feature, IFeature replacement) {
            super(featureModel);
            this.feature = feature;
            this.replacement = replacement;
        }

        public Message.IEncodable[] apply() {
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

            return new Message.IEncodable[]{new Message.FeatureModel(featureModel)};
        }

        public Message.IEncodable[] undo() {
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

            return new Message.IEncodable[]{new Message.FeatureModel(featureModel)};
        }
    }

    // adapted from FeatureTreeDeleteOperation
    public static class FeatureRemoveBelow extends FeatureModelMultipleStateChange {
        private LinkedList<IFeature> featureList = new LinkedList<>();
        private LinkedList<IFeature> containedFeatureList = new LinkedList<>();
        private LinkedList<IFeature> andList = new LinkedList<>();
        private LinkedList<IFeature> orList = new LinkedList<>();
        private LinkedList<IFeature> alternativeList = new LinkedList<>();

        public FeatureRemoveBelow(IFeatureModel featureModel, IFeature feature) {
            super(featureModel);

            final LinkedList<IFeature> list = new LinkedList<>();
            list.add(feature);
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
                    addStateChange(new FeatureRemove(featureModel, feat));
                }
            } else {
                final String containedFeatures = containedFeatureList.toString();
                throw new RuntimeException("can not delete following features which are contained in constraints: " +
                        containedFeatures.substring(1, containedFeatures.length() - 1));
            }
        }

        private void getFeaturesToDelete(List<IFeature> linkedList) {
            for (final IFeature feat : linkedList) {
                if (!feat.getStructure().getRelevantConstraints().isEmpty()) {
                    containedFeatureList.add(feat);
                }
                if (feat.getStructure().hasChildren()) {
                    getFeaturesToDelete(FeatureUtils.convertToFeatureList(feat.getStructure().getChildren()));
                }
                featureList.add(feat);
            }
        }

        public Message.IEncodable[] undo() {
            super.undo();
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
            return new Message.IEncodable[]{new Message.FeatureModel(featureModel)};
        }
    }

    // adapted from RenameFeatureOperation
    public static class FeatureRename extends FeatureModelStateChange {
        private final String oldName;
        private final String newName;

        public FeatureRename(IFeatureModel featureModel, String oldName, String newName) {
            super(featureModel);
            this.oldName = oldName;
            this.newName = newName;
        }

        public Message.IEncodable[] apply() {
            if (!featureModel.getRenamingsManager().renameFeature(oldName, newName))
                throw new RuntimeException("invalid renaming operation");
            return new Message.IEncodable[]{
                    new Message.FeatureRename(oldName, newName),
                    new Message.FeatureModel(featureModel)
            };
        }

        public Message.IEncodable[] undo() {
            if (!featureModel.getRenamingsManager().renameFeature(newName, oldName))
                throw new RuntimeException("invalid renaming operation");
            return new Message.IEncodable[]{
                    new Message.FeatureRename(newName, oldName),
                    new Message.FeatureModel(featureModel)
            };
        }
    }

    public static class FeatureSetDescription extends FeatureModelStateChange {
        private IFeature feature;
        private String oldDescription, description;

        public FeatureSetDescription(IFeatureModel featureModel, IFeature feature, String description) {
            super(featureModel);
            this.feature = feature;
            this.oldDescription = feature.getProperty().getDescription();
            this.description = description;
        }

        public Message.IEncodable[] apply() {
            feature.getProperty().setDescription(description);
            return new Message.IEncodable[]{new Message.FeatureModel(featureModel)};
        }

        public Message.IEncodable[] undo() {
            feature.getProperty().setDescription(oldDescription);
            return new Message.IEncodable[]{new Message.FeatureModel(featureModel)};
        }
    }

    public static class FeatureSetProperty extends FeatureModelStateChange {
        private IFeature feature;
        private String property, oldValue, value;
        private LinkedList<IFeatureStructure> oldMandatoryChildren;

        public FeatureSetProperty(IFeatureModel featureModel, IFeature feature, String property, String value) {
            super(featureModel);
            this.feature = feature;
            this.property = property;
            this.value = value;
        }

        private void setMandatoryChildrenToOptional() {
            feature.getStructure().getChildren().forEach(child -> {
                if (child.isMandatory()) {
                    oldMandatoryChildren.add(child);
                    child.setMandatory(false);
                }
            });
        }

        private void setOldMandatoryChildrenToMandatory() {
            oldMandatoryChildren.forEach(child -> child.setMandatory(true));
        }

        public Message.IEncodable[] apply() {
            oldMandatoryChildren = new LinkedList<>();
            switch (property) {
                case "abstract":
                    oldValue = feature.getStructure().isAbstract() ? "true" : "false";
                    feature.getStructure().setAbstract(value.equals("true"));
                    break;
                case "hidden":
                    oldValue = feature.getStructure().isHidden() ? "true" : "false";
                    feature.getStructure().setHidden(value.equals("true"));
                    break;
                case "mandatory":
                    oldValue = feature.getStructure().isMandatory() ? "true" : "false";

                    if (feature.getStructure().isRoot() && value.equals("false"))
                        throw new RuntimeException("can not set the root feature as optional");

                    IFeatureStructure parent = feature.getStructure().getParent();
                    if (parent != null && (parent.isOr() || parent.isAlternative()) && value.equals("true"))
                        throw new RuntimeException("can not set a child of a or/alternative group as mandatory");

                    feature.getStructure().setMandatory(value.equals("true"));
                    break;
                case "group":
                    oldValue = feature.getStructure().isOr() ? "or" :
                            feature.getStructure().isAlternative() ? "alternative" : "and";

                    if (value.equals("or")) {
                        setMandatoryChildrenToOptional();
                        feature.getStructure().changeToOr();
                    }

                    if (value.equals("alternative")) {
                        setMandatoryChildrenToOptional();
                        feature.getStructure().changeToAlternative();
                    }

                    if (value.equals("and"))
                        feature.getStructure().changeToAnd();
                    break;
            }
            return new Message.IEncodable[]{new Message.FeatureModel(featureModel)};
        }

        public Message.IEncodable[] undo() {
            switch (property) {
                case "abstract":
                    feature.getStructure().setAbstract(oldValue.equals("true"));
                    break;
                case "hidden":
                    feature.getStructure().setHidden(oldValue.equals("true"));
                    break;
                case "mandatory":
                    feature.getStructure().setMandatory(oldValue.equals("true"));
                    break;
                case "group":
                    if (oldValue.equals("or"))
                        feature.getStructure().changeToOr();
                    if (oldValue.equals("alternative"))
                        feature.getStructure().changeToAlternative();
                    if (oldValue.equals("and")) {
                        feature.getStructure().changeToAnd();
                        setOldMandatoryChildrenToMandatory();
                    }
                    break;
            }
            return new Message.IEncodable[]{new Message.FeatureModel(featureModel)};
        }
    }
}
