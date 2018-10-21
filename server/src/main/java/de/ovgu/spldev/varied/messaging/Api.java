package de.ovgu.spldev.varied.messaging;

import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.Artifact;
import de.ovgu.spldev.varied.StateContext;
import de.ovgu.spldev.varied.User;
import de.ovgu.spldev.varied.statechanges.StateChange;
import de.ovgu.spldev.varied.statechanges.featurediagram.*;

import java.util.LinkedList;

/**
 * To add a new kind of message: Add a type below and create a camel-cased inner class
 * that derives Message.IEncodable or Message.IDecodable. Possibly also add a state change.
 */
public class Api {
    /**
     * Types of messages. Decodable message types can also be decoded and are registered with Gson.
     */
    public enum TypeEnum {
        /**
         * generic exception wrapper
         */
        ERROR,
        /**
         * join a collaborative session
         */
        JOIN,
        /**
         * leave a collaborative session
         */
        LEAVE,
        /**
         * undo the last state change
         */
        UNDO,
        /**
         * undo the last undone state change
         */
        REDO,
        /**
         * contains multiple undoable messages of the same type
         * only the last message's response message is returned to the client
         */
        MULTIPLE_MESSAGES,
        /**
         * a serialized feature model
         */
        FEATURE_DIAGRAM_FEATURE_MODEL,
        /**
         * add a new feature below another feature
         */
        FEATURE_DIAGRAM_FEATURE_ADD_BELOW,
        /**
         * add a new feature above (adjacent) feature(s)
         */
        FEATURE_DIAGRAM_FEATURE_ADD_ABOVE,
        /**
         * remove a feature
         */
        FEATURE_DIAGRAM_FEATURE_REMOVE,
        /**
         * remove a feature and all its children recursively
         */
        FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW,
        /**
         * rename a feature
         */
        FEATURE_DIAGRAM_FEATURE_RENAME,
        /**
         * set a feature description
         */
        FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION,
        /**
         * set one of a feature's properties (e.g., abstract, hidden, mandatory, or, alternative)
         */
        FEATURE_DIAGRAM_FEATURE_SET_PROPERTY
    }

    public static class Error extends Message implements Message.IEncodable {
        String error;

        public Error(Throwable throwable) {
            super(TypeEnum.ERROR, null);
            this.error = throwable.toString();
            throwable.printStackTrace();
        }
    }

    public static class Undo extends Message implements Message.IApplicable {
        Undo(Artifact.Path artifactPath) {
            super(TypeEnum.UNDO, artifactPath);
        }

        public boolean isValid(StateContext stateContext) {
            if (!stateContext.getStateChangeStack().canUndo())
                throw new RuntimeException("can not undo");
            return true;
        }

        public IEncodable[] apply(StateContext stateContext) {
            return stateContext.getStateChangeStack().undo();
        }
    }

    public static class Redo extends Message implements Message.IApplicable {
        Redo(Artifact.Path artifactPath) {
            super(TypeEnum.REDO, artifactPath);
        }

        public boolean isValid(StateContext stateContext) {
            if (!stateContext.getStateChangeStack().canRedo())
                throw new RuntimeException("can not redo");
            return true;
        }

        public IEncodable[] apply(StateContext stateContext) {
            return stateContext.getStateChangeStack().redo();
        }
    }

    public static class MultipleMessages extends Message implements Message.IUndoable {
        private Message[] messages;

        public MultipleMessages(Artifact.Path artifactPath, Message[] messages) {
            super(TypeEnum.MULTIPLE_MESSAGES, artifactPath);
            this.messages = messages;
        }

        public LinkedList<IMultipleUndoable> getMessages() {
            LinkedList<IMultipleUndoable> messages = new LinkedList<>();
            for (Message message : this.messages) {
                if (!(message instanceof IMultipleUndoable))
                    throw new RuntimeException("expected multiple undoable message, got type " +
                            message.getClass().getName());
                messages.add((IMultipleUndoable) message);
            }
            return messages;
        }

        public boolean isValid(StateContext stateContext) {
            if (messages == null || messages.length == 0)
                throw new RuntimeException("no messages given");
            Class messageClass = messages[0].getClass();
            for (Message message : messages)
                if (message.getClass() != messageClass)
                    throw new RuntimeException("expected type " +
                            messageClass.getName() + ", got type " + message.getClass().getName());

            boolean valid = true;
            for (IMultipleUndoable message : getMessages())
                valid = message.isValid(stateContext) && valid;
            return valid;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new de.ovgu.spldev.varied.statechanges.MultipleMessages(stateContext, getMessages());
        }
    }

    public static class Join extends Message implements Message.IEncodable, Message.IDecodable {
        private String user;

        public Join(Artifact.Path artifactPath, User user) {
            super(TypeEnum.JOIN, artifactPath);
            this.user = user.getName();
        }
    }

    public static class Leave extends Message implements Message.IEncodable, Message.IDecodable {
        private String user;

        public Leave(Artifact.Path artifactPath, User user) {
            super(TypeEnum.LEAVE, artifactPath);
            this.user = user.getName();
        }
    }

    public static class FeatureDiagramFeatureModel extends Message implements Message.IEncodable {
        private IFeatureModel featureModel;

        public FeatureDiagramFeatureModel(Artifact.Path artifactPath, IFeatureModel featureModel) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_MODEL, artifactPath);
            this.featureModel = featureModel;
        }
    }

    public static class FeatureDiagramFeatureAddBelow extends Message implements Message.IUndoable {
        private String belowFeature;

        public FeatureDiagramFeatureAddBelow(Artifact.Path artifactPath, String belowFeature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_ADD_BELOW, artifactPath);
            this.belowFeature = belowFeature;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new FeatureAddBelow((StateContext.FeatureModel) stateContext, belowFeature);
        }
    }

    public static class FeatureDiagramFeatureAddAbove extends Message implements Message.IUndoable {
        private String[] aboveFeatures;

        public FeatureDiagramFeatureAddAbove(Artifact.Path artifactPath, String[] aboveFeatures) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_ADD_ABOVE, artifactPath);
            this.aboveFeatures = aboveFeatures;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new FeatureAddAbove((StateContext.FeatureModel) stateContext, aboveFeatures);
        }
    }

    public static class FeatureDiagramFeatureRemove extends Message implements Message.IMultipleUndoable {
        private String feature;

        public FeatureDiagramFeatureRemove(Artifact.Path artifactPath, String feature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_REMOVE, artifactPath);
            this.feature = feature;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new FeatureRemove((StateContext.FeatureModel) stateContext, feature);
        }
    }

    public static class FeatureDiagramFeatureRemoveBelow extends Message implements Message.IMultipleUndoable {
        private String feature;

        public FeatureDiagramFeatureRemoveBelow(Artifact.Path artifactPath, String feature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW, artifactPath);
            this.feature = feature;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new FeatureRemoveBelow((StateContext.FeatureModel) stateContext, feature);
        }

        public StateChange getStateChange(StateContext stateContext, Object multipleContext) {
            return new FeatureRemoveBelow((StateContext.FeatureModel) stateContext, feature, multipleContext);
        }

        public Object createMultipleContext() {
            return FeatureRemoveBelow.createMultipleContext();
        }

        public Object nextMultipleContext(StateChange stateChange, Object multipleContext) {
            return ((FeatureRemoveBelow) stateChange).nextMultipleContext(multipleContext);
        }
    }

    public static class FeatureDiagramFeatureRename extends Message implements Message.IEncodable, Message.IUndoable {
        private String oldFeature, newFeature;

        public FeatureDiagramFeatureRename(Artifact.Path artifactPath, String oldFeature, String newFeature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_RENAME, artifactPath);
            this.oldFeature = oldFeature;
            this.newFeature = newFeature;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new FeatureRename((StateContext.FeatureModel) stateContext, oldFeature, newFeature);
        }
    }

    public static class FeatureDiagramFeatureSetDescription extends Message implements Message.IUndoable {
        private String feature, description;

        public FeatureDiagramFeatureSetDescription(Artifact.Path artifactPath, String feature, String description) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION, artifactPath);
            this.feature = feature;
            this.description = description;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new FeatureSetDescription((StateContext.FeatureModel) stateContext, feature, description);
        }
    }

    public static class FeatureDiagramFeatureSetProperty extends Message implements Message.IMultipleUndoable {
        private String feature, property, value;

        public FeatureDiagramFeatureSetProperty(Artifact.Path artifactPath, String feature, String property, String value) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, artifactPath);
            this.feature = feature;
            this.property = property;
            this.value = value;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new FeatureSetProperty((StateContext.FeatureModel) stateContext, feature, property, value);
        }

        public StateChange getStateChange(StateContext stateContext, Object multipleContext) {
            return new FeatureSetProperty((StateContext.FeatureModel) stateContext, feature, property, value, multipleContext);
        }

        public Object createMultipleContext() {
            return property; // only allow the same property for all messages in the multiple message
        }

        public Object nextMultipleContext(StateChange stateChange, Object multipleContext) {
            return property;
        }
    }
}
