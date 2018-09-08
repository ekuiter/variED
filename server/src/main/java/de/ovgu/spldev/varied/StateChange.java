package de.ovgu.spldev.varied;

import de.ovgu.featureide.fm.core.base.FeatureUtils;
import de.ovgu.featureide.fm.core.base.*;
import de.ovgu.featureide.fm.core.base.impl.FMFactoryManager;
import de.ovgu.featureide.fm.core.functional.Functional;

import java.util.*;

import static de.ovgu.featureide.fm.core.localization.StringTable.DEFAULT_FEATURE_LAYER_CAPTION;

public abstract class StateChange {
    private boolean applyWasSuccessful = true, undoWasSuccessful = true;
    private Throwable applyThrowable, undoThrowable;

    final Message.IEncodable[] apply() {
        Message.IEncodable[] messages;
        if (undoWasSuccessful)
            try {
                messages = _apply();
            } catch (Throwable t) {
                applyWasSuccessful = false;
                messages = new Message.IEncodable[]{new Message.Error(t)};
                applyThrowable = t;
            }
        else
            messages = new Message.IEncodable[]{new Message.Error(
                    new RuntimeException("can not redo an invalid state change"))};
        return messages;
    }

    final Message.IEncodable[] undo() {
        Message.IEncodable[] messages;
        if (applyWasSuccessful)
            try {
                messages = _undo();
            } catch (Throwable t) {
                undoWasSuccessful = false;
                messages = new Message.IEncodable[]{new Message.Error(t)};
                undoThrowable = t;
            }
        else
            messages = new Message.IEncodable[]{new Message.Error(
                    new RuntimeException("can not undo an invalid state change"))};
        return messages;
    }

    // contract: do not throw if apply was successful, throw indicates that undo is invalid
    // throw also indicates that _the feature model was not changed_ (should be atomic).
    // this may throw and does not affect feature model integrity.
    abstract Message.IEncodable[] _apply();

    // contract: do not throw if undo was successful, throw indicates that redo is invalid
    // throw also indicates that _the feature model was not changed_ (should be atomic).
    // this MAY NOT normally throw because undoing a valid state change must always be possible!
    abstract Message.IEncodable[] _undo();

    Message.IEncodable[] applyMultiple() {
        return apply();
    }

    Message.IEncodable[] undoMultiple() {
        return undo();
    }

    static Message.IEncodable[] featureModelMessage(IFeatureModel featureModel) {
        return new Message.IEncodable[]{new Message.FeatureDiagramFeatureModel(featureModel)};
    }

    abstract static class MultipleStateChange extends StateChange {
        LinkedList<StateChange> stateChanges = new LinkedList<>();

        void addStateChange(StateChange stateChange) {
            stateChanges.add(stateChange);
        }

        // if applying one state change fails, undo all applied state changes to guarantee atomicity
        Message.IEncodable[] _apply() {
            Message.IEncodable[] stateChangeMessages = new Message.IEncodable[0];
            for (StateChange stateChange : stateChanges) {
                stateChangeMessages = stateChange.applyMultiple();
                if (!stateChange.applyWasSuccessful) {
                    boolean found = false;
                    for (final Iterator<StateChange> it = stateChanges.descendingIterator(); it.hasNext(); ) {
                        StateChange _stateChange = it.next();
                        if (found)
                            try {
                                _stateChange.undoMultiple();
                            } catch (Throwable t) {
                                throw new RuntimeException("error while undoing an invalid state change");
                            }
                        if (_stateChange == stateChange)
                            found = true;
                    }
                    throw new RuntimeException(stateChange.applyThrowable.getMessage());
                }
            }
            return stateChangeMessages;
        }

        // if undoing one state change fails, redo all undone state changes to guarantee atomicity
        Message.IEncodable[] _undo() {
            Message.IEncodable[] stateChangeMessages = new Message.IEncodable[0];
            for (final Iterator<StateChange> it = stateChanges.descendingIterator(); it.hasNext(); ) {
                StateChange stateChange = it.next();
                stateChangeMessages = stateChange.undoMultiple();
                if (!stateChange.undoWasSuccessful) {
                    boolean found = false;
                    for (StateChange _stateChange : stateChanges) {
                        if (found)
                            try {
                                _stateChange.applyMultiple();
                            } catch (Throwable t) {
                                throw new RuntimeException("error while redoing an invalid state change");
                            }
                        if (_stateChange == stateChange)
                            found = true;
                    }
                    throw new RuntimeException(stateChange.undoThrowable.getMessage());
                }
            }
            return stateChangeMessages;
        }
    }

    // adapted from MultiFeatureModelOperation
    static class MultipleMessages extends MultipleStateChange {
        public MultipleMessages(StateContext stateContext, LinkedList<Message.IUndoable> messages) {
            for (Message.IUndoable message : messages)
                addStateChange(message.getStateChange(stateContext));
        }
    }

    static class FeatureDiagram {
        public static class Feature {
            // adapted from CreateFeatureBelowOperation
            public static class AddBelow extends StateChange {
                private IFeatureModel featureModel;
                private IFeature feature;
                private IFeature newFeature;

                public AddBelow(IFeature feature, IFeatureModel featureModel) {
                    this.featureModel = featureModel;
                    this.feature = feature;
                }

                public Message.IEncodable[] _apply() {
                    int number = 1;

                    while (FeatureUtils.getFeatureNames(featureModel).contains(DEFAULT_FEATURE_LAYER_CAPTION + number)) {
                        number++;
                    }

                    newFeature = FMFactoryManager.getFactory(featureModel).createFeature(featureModel, DEFAULT_FEATURE_LAYER_CAPTION + number);
                    featureModel.addFeature(newFeature);
                    feature = featureModel.getFeature(feature.getName());
                    feature.getStructure().addChild(newFeature.getStructure());

                    return StateChange.featureModelMessage(featureModel);
                }

                public Message.IEncodable[] _undo() {
                    newFeature = featureModel.getFeature(newFeature.getName());
                    featureModel.deleteFeature(newFeature);
                    return StateChange.featureModelMessage(featureModel);
                }
            }

            // adapted from CreateFeatureAboveOperation
            public static class AddAbove extends StateChange {
                private IFeatureModel featureModel;
                private IFeature newCompound;
                private IFeature child;
                private LinkedList<IFeature> selectedFeatures;
                private HashMap<IFeature, Integer> children = new HashMap<>();
                private boolean parentOr = false;
                private boolean parentAlternative = false;

                public AddAbove(IFeatureModel featureModel, LinkedList<IFeature> selectedFeatures) {
                    this.featureModel = featureModel;
                    this.selectedFeatures = selectedFeatures;
                    child = selectedFeatures.get(0);
                    int number = 0;
                    while (FeatureUtils.getFeatureNames(featureModel).contains(DEFAULT_FEATURE_LAYER_CAPTION + ++number)) {
                    }

                    newCompound = FMFactoryManager.getFactory(featureModel).createFeature(featureModel, DEFAULT_FEATURE_LAYER_CAPTION + number);
                }

                public Message.IEncodable[] _apply() {
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

                    return StateChange.featureModelMessage(featureModel);
                }

                public Message.IEncodable[] _undo() {
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

                    return StateChange.featureModelMessage(featureModel);
                }
            }

            // adapted from DeleteFeatureOperation
            public static class Remove extends StateChange {
                private IFeatureModel featureModel;
                private IFeature feature;
                private IFeature oldParent;
                private int oldIndex;
                private LinkedList<IFeature> oldChildren;
                private boolean deleted = false;
                private boolean or = false;
                private boolean alternative = false;
                private final IFeature replacement;

                public Remove(IFeatureModel featureModel, IFeature feature) {
                    this.featureModel = featureModel;
                    this.feature = feature;
                    replacement = null;
                }

                public Remove(IFeatureModel featureModel, IFeature feature, IFeature replacement) {
                    this.featureModel = featureModel;
                    this.feature = feature;
                    this.replacement = replacement;
                }

                public Message.IEncodable[] _apply() {
                    feature = featureModel.getFeature(feature.getName());
                    oldParent = FeatureUtils.getParent(feature);
                    if (oldParent != null) {
                        oldIndex = oldParent.getStructure().getChildIndex(feature.getStructure());
                        or = oldParent.getStructure().isOr();
                        alternative = oldParent.getStructure().isAlternative();
                    }
                    oldChildren = new LinkedList<>();
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

                    return StateChange.featureModelMessage(featureModel);
                }

                public Message.IEncodable[] applyMultiple() {
                    // do nothing if the feature has already been removed by another
                    // state change in a multiple message
                    if (featureModel.getFeature(feature.getName()) == null)
                        return StateChange.featureModelMessage(featureModel);
                    return apply();
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

                    return StateChange.featureModelMessage(featureModel);
                }
            }

            // adapted from FeatureTreeDeleteOperation
            public static class RemoveBelow extends MultipleStateChange {
                private IFeatureModel featureModel;
                private LinkedList<IFeature> featureList = new LinkedList<>();
                private LinkedList<IFeature> containedFeatureList = new LinkedList<>();
                private LinkedList<IFeature> andList = new LinkedList<>();
                private LinkedList<IFeature> orList = new LinkedList<>();
                private LinkedList<IFeature> alternativeList = new LinkedList<>();

                public RemoveBelow(IFeatureModel featureModel, IFeature feature) {
                    this.featureModel = featureModel;
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
                            addStateChange(new Remove(featureModel, feat));
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

                public Message.IEncodable[] _undo() {
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
                    return StateChange.featureModelMessage(featureModel);
                }
            }

            // adapted from RenameFeatureOperation
            public static class Rename extends StateChange {
                private IFeatureModel featureModel;
                private final String oldName;
                private final String newName;

                public Rename(IFeatureModel featureModel, String oldName, String newName) {
                    this.featureModel = featureModel;
                    this.oldName = oldName;
                    this.newName = newName;
                }

                public Message.IEncodable[] _apply() {
                    if (!featureModel.getRenamingsManager().renameFeature(oldName, newName))
                        throw new RuntimeException("invalid renaming operation");
                    return new Message.IEncodable[]{
                            new Message.FeatureDiagramFeatureRename(oldName, newName),
                            new Message.FeatureDiagramFeatureModel(featureModel)
                    };
                }

                public Message.IEncodable[] _undo() {
                    if (!featureModel.getRenamingsManager().renameFeature(newName, oldName))
                        throw new RuntimeException("invalid renaming operation");
                    return new Message.IEncodable[]{
                            new Message.FeatureDiagramFeatureRename(newName, oldName),
                            new Message.FeatureDiagramFeatureModel(featureModel)
                    };
                }
            }

            public static class SetDescription extends StateChange {
                private IFeatureModel featureModel;
                private IFeature feature;
                private String oldDescription, description;

                public SetDescription(IFeatureModel featureModel, IFeature feature, String description) {
                    this.featureModel = featureModel;
                    this.feature = feature;
                    this.oldDescription = feature.getProperty().getDescription();
                    this.description = description;
                }

                public Message.IEncodable[] _apply() {
                    feature.getProperty().setDescription(description);
                    return StateChange.featureModelMessage(featureModel);
                }

                public Message.IEncodable[] _undo() {
                    feature.getProperty().setDescription(oldDescription);
                    return StateChange.featureModelMessage(featureModel);
                }
            }

            public static class SetProperty extends StateChange {
                private IFeatureModel featureModel;
                private IFeature feature;
                private String property, oldValue, value;
                private LinkedList<IFeatureStructure> oldMandatoryChildren;

                public SetProperty(IFeatureModel featureModel, IFeature feature, String property, String value) {
                    this.featureModel = featureModel;
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

                public Message.IEncodable[] _apply() {
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
                    return StateChange.featureModelMessage(featureModel);
                }

                public Message.IEncodable[] _undo() {
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
                    return StateChange.featureModelMessage(featureModel);
                }
            }
        }
    }
}
