package de.ovgu.spldev.varied.messaging;

import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.Endpoint;
import de.ovgu.spldev.varied.StateContext;
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
         * a user has subscribed an editing session
         */
        USER_SUBSCRIBE,
        /**
         * a user has unsubscribed an editing session
         */
        USER_UNSUBSCRIBE,
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
            super(TypeEnum.ERROR);
            this.error = throwable.toString();
            throwable.printStackTrace();
        }
    }

    public static class Undo extends Message implements Message.IApplicable {
        Undo() {
            super(TypeEnum.UNDO);
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
        Redo() {
            super(TypeEnum.REDO);
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

        public MultipleMessages(Message[] messages) {
            super(TypeEnum.MULTIPLE_MESSAGES);
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

    public static class UserSubscribe extends Message implements Message.IEncodable {
        private String user;

        public UserSubscribe(Endpoint endpoint) {
            super(TypeEnum.USER_SUBSCRIBE);
            this.user = endpoint.getLabel();
        }
    }

    public static class UserUnsubscribe extends Message implements Message.IEncodable {
        private String user;

        public UserUnsubscribe(Endpoint endpoint) {
            super(TypeEnum.USER_UNSUBSCRIBE);
            this.user = endpoint.getLabel();
        }
    }

    public static class FeatureDiagramFeatureModel extends Message implements Message.IEncodable {
        private IFeatureModel featureModel;

        public FeatureDiagramFeatureModel(IFeatureModel featureModel) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_MODEL);
            this.featureModel = featureModel;
        }
    }

    public static class FeatureDiagramFeatureAddBelow extends Message implements Message.IUndoable {
        private String belowFeature;

        public FeatureDiagramFeatureAddBelow(String belowFeature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_ADD_BELOW);
            this.belowFeature = belowFeature;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new FeatureAddBelow(stateContext.getFeatureModel(), belowFeature);
        }
    }

    public static class FeatureDiagramFeatureAddAbove extends Message implements Message.IUndoable {
        private String[] aboveFeatures;

        public FeatureDiagramFeatureAddAbove(String[] aboveFeatures) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_ADD_ABOVE);
            this.aboveFeatures = aboveFeatures;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new FeatureAddAbove(stateContext.getFeatureModel(), aboveFeatures);
        }
    }

    public static class FeatureDiagramFeatureRemove extends Message implements Message.IMultipleUndoable {
        private String feature;

        public FeatureDiagramFeatureRemove(String feature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_REMOVE);
            this.feature = feature;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new FeatureRemove(stateContext.getFeatureModel(), feature);
        }
    }

    public static class FeatureDiagramFeatureRemoveBelow extends Message implements Message.IMultipleUndoable {
        private String feature;

        public FeatureDiagramFeatureRemoveBelow(String feature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW);
            this.feature = feature;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new FeatureRemoveBelow(stateContext.getFeatureModel(), feature);
        }

        public StateChange getStateChange(StateContext stateContext, Object multipleContext) {
            return new FeatureRemoveBelow(stateContext.getFeatureModel(), feature, multipleContext);
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

        public FeatureDiagramFeatureRename(String oldFeature, String newFeature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_RENAME);
            this.oldFeature = oldFeature;
            this.newFeature = newFeature;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new FeatureRename(stateContext.getFeatureModel(), oldFeature, newFeature);
        }
    }

    public static class FeatureDiagramFeatureSetDescription extends Message implements Message.IUndoable {
        private String feature, description;

        public FeatureDiagramFeatureSetDescription(String feature, String description) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION);
            this.feature = feature;
            this.description = description;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new FeatureSetDescription(stateContext.getFeatureModel(), feature, description);
        }
    }

    public static class FeatureDiagramFeatureSetProperty extends Message implements Message.IMultipleUndoable {
        private String feature, property, value;

        public FeatureDiagramFeatureSetProperty(String feature, String property, String value) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY);
            this.feature = feature;
            this.property = property;
            this.value = value;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new FeatureSetProperty(stateContext.getFeatureModel(), feature, property, value);
        }

        public StateChange getStateChange(StateContext stateContext, Object multipleContext) {
            return new FeatureSetProperty(
                    stateContext.getFeatureModel(), feature, property, value, multipleContext);
        }

        public Object createMultipleContext() {
            return property; // only allow the same property for all messages in the multiple message
        }

        public Object nextMultipleContext(StateChange stateChange, Object multipleContext) {
            return property;
        }
    }
}
