package de.ovgu.spldev.varied;

import com.google.gson.typeadapters.RuntimeTypeAdapterFactory;
import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;

import java.util.LinkedList;
import java.util.Objects;
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
         * contains multiple messages of the same type manipulating the feature model
         */
        FEATURE_DIAGRAM_FEATURE_MODEL_MULTIPLE,
        /**
         * undo the last state change
         */
        FEATURE_DIAGRAM_UNDO,
        /**
         * undo the last undone state change
         */
        FEATURE_DIAGRAM_REDO,
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

    public interface IEncodable {
    }

    public interface IDecodable {
        boolean isValid(StateContext stateContext);
    }

    public interface IApplicable extends IDecodable {
        Message.IEncodable[] apply(StateContext stateContext);
    }

    public interface IUndoable extends IDecodable {
        StateChange getStateChange(StateContext stateContext);
    }

    public static class Error extends Message implements IEncodable {
        String error;

        public Error(Throwable throwable) {
            super(TypeEnum.ERROR);
            this.error = throwable.toString();
            throwable.printStackTrace();
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

    public static class FeatureDiagramFeatureModelMultiple extends Message implements IUndoable {
        private Message[] messages;

        public FeatureDiagramFeatureModelMultiple(Message[] messages) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_MODEL_MULTIPLE);
            this.messages = messages;
        }

        public LinkedList<Message.IUndoable> getUndoableMessages() {
            LinkedList<Message.IUndoable> undoableMessages = new LinkedList<>();
            for (Message message : messages) {
                if (!(message instanceof Message.IUndoable))
                    throw new RuntimeException("expected undoable message, got type " +
                            message.getClass().getName());
                undoableMessages.add((Message.IUndoable) message);
            }
            return undoableMessages;
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
            for (Message.IUndoable message : getUndoableMessages())
                valid = message.isValid(stateContext) && valid;
            return valid;
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new StateChange.FeatureModelMultiple(stateContext, getUndoableMessages());
        }
    }

    public static class FeatureDiagramUndo extends Message implements IApplicable {
        FeatureDiagramUndo(Type type) {
            super(TypeEnum.FEATURE_DIAGRAM_UNDO);
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

    public static class FeatureDiagramRedo extends Message implements IApplicable {
        FeatureDiagramRedo(Type type) {
            super(TypeEnum.FEATURE_DIAGRAM_REDO);
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

    public static class FeatureDiagramFeatureAddBelow extends Message implements IUndoable {
        private String belowFeature;

        public FeatureDiagramFeatureAddBelow(String belowFeature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_ADD_BELOW);
            this.belowFeature = belowFeature;
        }

        public boolean isValid(StateContext stateContext) {
            return FeatureUtils.requireFeature(stateContext.getFeatureModel(), belowFeature);
        }

        public StateChange getStateChange(StateContext stateContext) {
            IFeatureModel featureModel = stateContext.getFeatureModel();
            IFeature _belowFeature = featureModel.getFeature(belowFeature);
            return new StateChange.FeatureDiagram.Feature.AddBelow(_belowFeature, featureModel);
        }
    }

    public static class FeatureDiagramFeatureAddAbove extends Message implements IUndoable {
        private String[] aboveFeatures;

        public FeatureDiagramFeatureAddAbove(String[] aboveFeatures) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_ADD_ABOVE);
            this.aboveFeatures = aboveFeatures;
        }

        public boolean isValid(StateContext stateContext) {
            if (aboveFeatures.length == 0)
                throw new RuntimeException("no features given");
            IFeatureModel featureModel = stateContext.getFeatureModel();
            FeatureUtils.requireFeatures(featureModel, aboveFeatures);
            FeatureUtils.requireSiblings(featureModel, aboveFeatures);
            return true;
        }

        public StateChange getStateChange(StateContext stateContext) {
            IFeatureModel featureModel = stateContext.getFeatureModel();
            LinkedList<IFeature> _aboveFeatures = new LinkedList<>();
            for (String aboveFeature : aboveFeatures)
                _aboveFeatures.add(featureModel.getFeature(aboveFeature));
            FeatureUtils.sortSiblingFeatures(_aboveFeatures);
            return new StateChange.FeatureDiagram.Feature.AddAbove(featureModel, _aboveFeatures);
        }
    }

    public static class FeatureDiagramFeatureRemove extends Message implements IUndoable {
        private String feature;

        public FeatureDiagramFeatureRemove(String feature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_REMOVE);
            this.feature = feature;
        }

        public boolean isValid(StateContext stateContext) {
            IFeatureModel featureModel = stateContext.getFeatureModel();
            FeatureUtils.requireFeature(featureModel, feature);
            IFeature feature = featureModel.getFeature(this.feature);
            if (feature.getStructure().isRoot() && feature.getStructure().getChildren().size() != 1)
                throw new RuntimeException("can only delete root feature when it has exactly one child");
            return true;
        }

        public StateChange getStateChange(StateContext stateContext) {
            IFeatureModel featureModel = stateContext.getFeatureModel();
            IFeature _feature = featureModel.getFeature(feature);
            return new StateChange.FeatureDiagram.Feature.Remove(featureModel, _feature);
        }
    }

    public static class FeatureDiagramFeatureRemoveBelow extends Message implements IUndoable {
        private String feature;

        public FeatureDiagramFeatureRemoveBelow(String feature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW);
            this.feature = feature;
        }

        public boolean isValid(StateContext stateContext) {
            IFeatureModel featureModel = stateContext.getFeatureModel();
            FeatureUtils.requireFeature(featureModel, feature);
            IFeature feature = featureModel.getFeature(this.feature);
            if (feature.getStructure().isRoot())
                throw new RuntimeException("can not delete root feature and its children");
            return true;
        }

        public StateChange getStateChange(StateContext stateContext) {
            IFeatureModel featureModel = stateContext.getFeatureModel();
            IFeature _feature = featureModel.getFeature(feature);
            return new StateChange.FeatureDiagram.Feature.RemoveBelow(featureModel, _feature);
        }
    }

    public static class FeatureDiagramFeatureRename extends Message implements IEncodable, IUndoable {
        private String oldFeature, newFeature;

        public FeatureDiagramFeatureRename(String oldFeature, String newFeature) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_RENAME);
            this.oldFeature = oldFeature;
            this.newFeature = newFeature;
        }

        public boolean isValid(StateContext stateContext) {
            return FeatureUtils.requireFeature(stateContext.getFeatureModel(), oldFeature);
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

        public boolean isValid(StateContext stateContext) {
            return FeatureUtils.requireFeature(stateContext.getFeatureModel(), feature) &&
                    (StringUtils.isPresent(description) || Objects.equals(description, ""));
        }

        public StateChange getStateChange(StateContext stateContext) {
            IFeatureModel featureModel = stateContext.getFeatureModel();
            IFeature _feature = featureModel.getFeature(feature);
            return new StateChange.FeatureDiagram.Feature.SetDescription(featureModel, _feature, description);
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

        public boolean isValid(StateContext stateContext) {
            IFeatureModel featureModel = stateContext.getFeatureModel();
            FeatureUtils.requireFeature(featureModel, feature);
            if (!StringUtils.isOneOf(property, new String[]{"abstract", "hidden", "mandatory", "group"}))
                throw new RuntimeException("invalid property given");
            if (property.equals("group")) {
                if (!StringUtils.isOneOf(value, new String[]{"and", "or", "alternative"}))
                    throw new RuntimeException("invalid value given");
            } else if (!StringUtils.isOneOf(value, new String[]{"true", "false"}))
                throw new RuntimeException("invalid value given");
            return true;
        }

        public StateChange getStateChange(StateContext stateContext) {
            IFeatureModel featureModel = stateContext.getFeatureModel();
            IFeature _feature = featureModel.getFeature(feature);
            return new StateChange.FeatureDiagram.Feature.SetProperty(featureModel, _feature, property, value);
        }
    }
}