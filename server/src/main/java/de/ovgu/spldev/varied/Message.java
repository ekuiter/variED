package de.ovgu.spldev.varied;

import com.google.gson.typeadapters.RuntimeTypeAdapterFactory;
import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.event.FeatureIDEEvent;

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
         * an endpoint has subscribed an editing session
         */
        ENDPOINT_SUBSCRIBE,
        /**
         * an endpoint has unsubscribed an editing session
         */
        ENDPOINT_UNSUBSCRIBE,
        /**
         * a serialized feature model
         */
        FEATURE_MODEL,
        /**
         * a diff between the current and last known feature model (used for compression)
         */
        FEATURE_MODEL_PATCH, // todo
        /**
         * undo the last state change
         */
        UNDO,
        /**
         * undo the last undone state change
         */
        REDO,
        /**
         * add a new feature below another feature
         */
        FEATURE_ADD_BELOW,
        /**
         * add a new feature above (adjacent) feature(s)
         */
        FEATURE_ADD_ABOVE,
        /**
         * remove a feature
         */
        FEATURE_REMOVE,
        /**
         * rename a feature
         */
        FEATURE_RENAME
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

    public interface IEncodable { }

    public interface IDecodable {
        boolean isValid(StateContext stateContext);
    }

    public interface IApplicable extends IDecodable {
        Message.IEncodable apply(StateContext stateContext);
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

    public static class EndpointSubscribe extends Message implements IEncodable {
        private String endpoint;

        public EndpointSubscribe(Endpoint endpoint) {
            super(TypeEnum.ENDPOINT_SUBSCRIBE);
            this.endpoint = endpoint.getLabel();
        }
    }

    public static class EndpointUnsubscribe extends Message implements IEncodable {
        private String endpoint;

        public EndpointUnsubscribe(Endpoint endpoint) {
            super(TypeEnum.ENDPOINT_UNSUBSCRIBE);
            this.endpoint = endpoint.getLabel();
        }
    }

    public static class FeatureModel extends Message implements IEncodable {
        private IFeatureModel featureModel;

        public FeatureModel(IFeatureModel featureModel) {
            super(TypeEnum.FEATURE_MODEL);
            this.featureModel = featureModel;
        }
    }

    public static class Undo extends Message implements IApplicable {
        Undo(Type type) {
            super(TypeEnum.UNDO);
        }

        public boolean isValid(StateContext stateContext) {
            if (!stateContext.getStateChangeStack().canUndo())
                throw new RuntimeException("can not undo");
            return true;
        }

        public Message.IEncodable apply(StateContext stateContext) {
            return stateContext.getStateChangeStack().undo();
        }
    }

    public static class Redo extends Message implements IApplicable {
        Redo(Type type) {
            super(TypeEnum.REDO);
        }

        public boolean isValid(StateContext stateContext) {
            if (!stateContext.getStateChangeStack().canRedo())
                throw new RuntimeException("can not redo");
            return true;
        }

        public Message.IEncodable apply(StateContext stateContext) {
            return stateContext.getStateChangeStack().redo();
        }
    }

    public static class FeatureAddBelow extends Message implements IUndoable {
        private String belowFeature;

        public FeatureAddBelow(String belowFeature) {
            super(TypeEnum.FEATURE_ADD_BELOW);
            this.belowFeature = belowFeature;
        }

        public boolean isValid(StateContext stateContext) {
            return FeatureUtils.requireFeature(stateContext.getFeatureModel(), belowFeature);
        }

        public StateChange getStateChange(StateContext stateContext) {
            IFeatureModel featureModel = stateContext.getFeatureModel();
            IFeature _belowFeature = featureModel.getFeature(belowFeature);
            return new StateChange.FeatureAdd(_belowFeature, featureModel);
        }
    }

    public static class FeatureAddAbove extends Message implements IUndoable {
        private String[] aboveFeatures;

        public FeatureAddAbove(String[] aboveFeatures) {
            super(TypeEnum.FEATURE_ADD_ABOVE);
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
            return new StateChange.FeatureAddAbove(featureModel, _aboveFeatures);
        }
    }

    public static class FeatureRemove extends Message implements IUndoable {
        private String feature;

        public FeatureRemove(String feature) {
            super(TypeEnum.FEATURE_REMOVE);
            this.feature = feature;
        }

        public boolean isValid(StateContext stateContext) {
            return FeatureUtils.requireFeature(stateContext.getFeatureModel(), feature);
        }

        public StateChange getStateChange(StateContext stateContext) {
            IFeatureModel featureModel = stateContext.getFeatureModel();
            IFeature _feature = featureModel.getFeature(feature);
            return new StateChange.FeatureDelete(featureModel, _feature);
        }
    }

    public static class FeatureRename extends Message implements IUndoable {
        private String oldFeature, newFeature;

        public FeatureRename(String oldFeature, String newFeature) {
            super(TypeEnum.FEATURE_RENAME);
            this.oldFeature = oldFeature;
            this.newFeature = newFeature;
        }

        public boolean isValid(StateContext stateContext) {
            return FeatureUtils.requireFeature(stateContext.getFeatureModel(), oldFeature);
        }

        public StateChange getStateChange(StateContext stateContext) {
            return new StateChange.FeatureNameChanged(stateContext.getFeatureModel(), oldFeature, newFeature);
        }
    }
}
