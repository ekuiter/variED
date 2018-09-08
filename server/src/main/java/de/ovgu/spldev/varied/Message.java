package de.ovgu.spldev.varied;

import com.google.gson.typeadapters.RuntimeTypeAdapterFactory;
import de.ovgu.featureide.fm.core.base.IFeatureModel;

import java.util.LinkedList;
import java.util.stream.Stream;

/**
 * Messages that can be serialized to be broadcast to all endpoints subscribed to an editing session.
 */
abstract public class Message {
    /**
     * Types of messages. Decodable message types can also be decoded and are registered with Gson.
     */
    private enum TypeEnum {
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

    public static class Type {
        private TypeEnum typeEnum;

        private Type(TypeEnum typeEnum) {
            this.typeEnum = typeEnum;
        }

        public Type(String s) {
            try {
                this.typeEnum = TypeEnum.valueOf(s);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("invalid message type " + s);
            }
        }

        public String toString() {
            return typeEnum.toString();
        }

        private static String[] getTypes() {
            return Stream.of(TypeEnum.values()).map(TypeEnum::toString).toArray(String[]::new);
        }

        public static RuntimeTypeAdapterFactory<Message> registerSubtypes(RuntimeTypeAdapterFactory<Message> runtimeTypeAdapterFactory) {
            for (String type : getTypes())
                try {
                    Class klass = Class.forName(StringUtils.toClassName(Message.class.getName() + "$", type));
                    if (IDecodable.class.isAssignableFrom(klass))
                        runtimeTypeAdapterFactory = runtimeTypeAdapterFactory.registerSubtype(klass, type);
                } catch (ClassNotFoundException e) {
                }
            return runtimeTypeAdapterFactory;
        }
    }

    /**
     * every message stores its type for serialization
     */
    private Type type;

    Message(Type type) {
        this.type = type;
    }

    Message(TypeEnum typeEnum) {
        this.type = new Type(typeEnum);
    }

    public String toString() {
        return new MessageSerializer.MessageEncoder().encode(this);
    }

    // may be sent by the server
    public interface IEncodable {
    }

    // may be received by the server
    public interface IDecodable {
        default boolean isValid(StateContext stateContext) {
            return true;
        }
    }

    // may be received and applied (but not undone)
    public interface IApplicable extends IDecodable {
        Message.IEncodable[] apply(StateContext stateContext);
    }

    // may be received, applied, undone and redone
    public interface IUndoable extends IDecodable {
        StateChange getStateChange(StateContext stateContext);
    }

    // may be received, applied, undone and redone as a single message,
    // but also as part of a multiple message
    public interface IMultipleUndoable extends IUndoable {
        default StateChange getStateChange(StateContext stateContext, Object multipleContext) {
            return getStateChange(stateContext);
        }

        default Object createMultipleContext() {
            return null;
        }

        default Object nextMultipleContext(StateChange stateChange, Object multipleContext) {
            return null;
        }
    }

    public static class Error extends Message implements IEncodable {
        String error;

        public Error(Throwable throwable) {
            super(TypeEnum.ERROR);
            this.error = throwable.toString();
            throwable.printStackTrace();
        }
    }

    public static class Undo extends Message implements IApplicable {
        Undo() {
            super(TypeEnum.UNDO);
        }

        public boolean isValid(StateContext stateContext) {
            if (!stateContext.getStateChangeStack().canUndo())
                throw new RuntimeException("can not undo");
            return true;
        }

        public Message.IEncodable[] apply(StateContext stateContext) {
            return stateContext.getStateChangeStack().undo();
        }
    }

    public static class Redo extends Message implements IApplicable {
        Redo() {
            super(TypeEnum.REDO);
        }

        public boolean isValid(StateContext stateContext) {
            if (!stateContext.getStateChangeStack().canRedo())
                throw new RuntimeException("can not redo");
            return true;
        }

        public Message.IEncodable[] apply(StateContext stateContext) {
            return stateContext.getStateChangeStack().redo();
        }
    }

    public static class MultipleMessages extends Message implements IUndoable {
        private Message[] messages;

        public MultipleMessages(Message[] messages) {
            super(TypeEnum.MULTIPLE_MESSAGES);
            this.messages = messages;
        }

        public LinkedList<Message.IMultipleUndoable> getMessages() {
            LinkedList<Message.IMultipleUndoable> messages = new LinkedList<>();
            for (Message message : this.messages) {
                if (!(message instanceof Message.IMultipleUndoable))
                    throw new RuntimeException("expected multiple undoable message, got type " +
                            message.getClass().getName());
                messages.add((Message.IMultipleUndoable) message);
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
            for (Message.IMultipleUndoable message : getMessages())
                valid = message.isValid(stateContext) && valid;
            return valid;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new StateChange.MultipleMessages(stateContext, getMessages());
        }
    }

    public static class UserSubscribe extends Message implements IEncodable {
        private String user;

        public UserSubscribe(Endpoint endpoint) {
            super(TypeEnum.USER_SUBSCRIBE);
            this.user = endpoint.getLabel();
        }
    }

    public static class UserUnsubscribe extends Message implements IEncodable {
        private String user;

        public UserUnsubscribe(Endpoint endpoint) {
            super(TypeEnum.USER_UNSUBSCRIBE);
            this.user = endpoint.getLabel();
        }
    }

    public static class FeatureDiagramFeatureModel extends Message implements IEncodable {
        private IFeatureModel featureModel;

        public FeatureDiagramFeatureModel(IFeatureModel featureModel) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_MODEL);
            this.featureModel = featureModel;
        }
    }

    public static class FeatureDiagramFeatureAddBelow extends Message implements IUndoable {
        private String belowFeature;

        public FeatureDiagramFeatureAddBelow(String belowFeature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_ADD_BELOW);
            this.belowFeature = belowFeature;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new StateChange.FeatureDiagram.Feature.AddBelow(stateContext.getFeatureModel(), belowFeature);
        }
    }

    public static class FeatureDiagramFeatureAddAbove extends Message implements IUndoable {
        private String[] aboveFeatures;

        public FeatureDiagramFeatureAddAbove(String[] aboveFeatures) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_ADD_ABOVE);
            this.aboveFeatures = aboveFeatures;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new StateChange.FeatureDiagram.Feature.AddAbove(stateContext.getFeatureModel(), aboveFeatures);
        }
    }

    public static class FeatureDiagramFeatureRemove extends Message implements IMultipleUndoable {
        private String feature;

        public FeatureDiagramFeatureRemove(String feature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_REMOVE);
            this.feature = feature;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new StateChange.FeatureDiagram.Feature.Remove(stateContext.getFeatureModel(), feature);
        }
    }

    public static class FeatureDiagramFeatureRemoveBelow extends Message implements IMultipleUndoable {
        private String feature;

        public FeatureDiagramFeatureRemoveBelow(String feature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW);
            this.feature = feature;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new StateChange.FeatureDiagram.Feature.RemoveBelow(stateContext.getFeatureModel(), feature);
        }

        public StateChange getStateChange(StateContext stateContext, Object multipleContext) {
            return new StateChange.FeatureDiagram.Feature.RemoveBelow(stateContext.getFeatureModel(), feature, multipleContext);
        }

        public Object createMultipleContext() {
            return StateChange.FeatureDiagram.Feature.RemoveBelow.createMultipleContext();
        }

        public Object nextMultipleContext(StateChange stateChange, Object multipleContext) {
            return ((StateChange.FeatureDiagram.Feature.RemoveBelow) stateChange).nextMultipleContext(multipleContext);
        }
    }

    public static class FeatureDiagramFeatureRename extends Message implements IEncodable, IUndoable {
        private String oldFeature, newFeature;

        public FeatureDiagramFeatureRename(String oldFeature, String newFeature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_RENAME);
            this.oldFeature = oldFeature;
            this.newFeature = newFeature;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new StateChange.FeatureDiagram.Feature.Rename(stateContext.getFeatureModel(), oldFeature, newFeature);
        }
    }

    public static class FeatureDiagramFeatureSetDescription extends Message implements IUndoable {
        private String feature, description;

        public FeatureDiagramFeatureSetDescription(String feature, String description) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION);
            this.feature = feature;
            this.description = description;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new StateChange.FeatureDiagram.Feature.SetDescription(stateContext.getFeatureModel(), feature, description);
        }
    }

    public static class FeatureDiagramFeatureSetProperty extends Message implements IUndoable {
        private String feature, property, value;

        public FeatureDiagramFeatureSetProperty(String feature, String property, String value) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY);
            this.feature = feature;
            this.property = property;
            this.value = value;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new StateChange.FeatureDiagram.Feature.SetProperty(stateContext.getFeatureModel(), feature, property, value);
        }
    }
}