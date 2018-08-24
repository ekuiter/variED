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
    public static class Type {
        /**
         * Types of messages. Decodable message types can also be decoded and are registered with Gson.
         */
        private enum InternalType {
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
            FEATURE_MODEL_PATCH,
            /**
             * undo the last state change
             */
            UNDO,
            /**
             * undo the last undone state change
             */
            REDO,
            /**
             * the feature model was changed according to a FeatureIDE event
             */
            FEATURE_IDE_EVENT
        }

        private InternalType internalType;
        private FeatureIDEEvent.EventType featureIDEEventType;

        private Type(InternalType internalType) {
            this.internalType = internalType;
        }

        private Type(FeatureIDEEvent.EventType featureIDEEventType) {
            this.internalType = InternalType.FEATURE_IDE_EVENT;
            this.featureIDEEventType = featureIDEEventType;
        }

        public Type(String s) {
            try {
                this.internalType = InternalType.valueOf(s);
            } catch (IllegalArgumentException e) {
                try {
                    this.internalType = InternalType.FEATURE_IDE_EVENT;
                    this.featureIDEEventType = FeatureIDEEvent.EventType.valueOf(s);
                } catch (IllegalArgumentException f) {
                    throw new RuntimeException("invalid message type " + s);
                }
            }
        }

        public String toString() {
            return internalType == InternalType.FEATURE_IDE_EVENT ? featureIDEEventType.toString() : internalType.toString();
        }

        private static String[] getTypes() {
            return Stream.concat(
                    Stream.of(InternalType.values())
                            .filter(t -> t != InternalType.FEATURE_IDE_EVENT)
                            .map(InternalType::toString),
                    Stream.of(FeatureIDEEvent.EventType.values()).map(FeatureIDEEvent.EventType::toString)
            ).toArray(String[]::new);
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

    Message(Type.InternalType internalType) {
        this.type = new Type(internalType);
    }

    Message(FeatureIDEEvent.EventType featureIDEEventType) {
        this.type = new Type(featureIDEEventType);
    }

    public String toString() {
        return new MessageSerializer.MessageEncoder().encode(this);
    }

    public interface IDecodable {
        boolean isValid(StateContext stateContext);
    }

    public interface IApplicable extends IDecodable {
        Message apply(StateContext stateContext);
    }

    public interface IUndoable extends IDecodable {
        StateChange getStateChange(StateContext stateContext);
    }

    public static class Error extends Message {
        String error;

        public Error(Throwable throwable) {
            super(Type.InternalType.ERROR);
            this.error = throwable.toString();
            throwable.printStackTrace();
        }
    }

    public static class EndpointSubscribe extends Message {
        private String endpoint;

        public EndpointSubscribe(Endpoint endpoint) {
            super(Type.InternalType.ENDPOINT_SUBSCRIBE);
            this.endpoint = endpoint.getLabel();
        }
    }

    public static class EndpointUnsubscribe extends Message {
        private String endpoint;

        public EndpointUnsubscribe(Endpoint endpoint) {
            super(Type.InternalType.ENDPOINT_UNSUBSCRIBE);
            this.endpoint = endpoint.getLabel();
        }
    }

    public static class FeatureModel extends Message {
        private IFeatureModel featureModel;

        public FeatureModel(IFeatureModel featureModel) {
            super(Type.InternalType.FEATURE_MODEL);
            this.featureModel = featureModel;
        }
    }

    public static class Undo extends Message implements IApplicable {
        Undo(Type type) {
            super(Type.InternalType.UNDO);
        }

        public boolean isValid(StateContext stateContext) {
            if (!stateContext.getStateChangeStack().canUndo())
                throw new RuntimeException("can not undo");
            return true;
        }

        public Message apply(StateContext stateContext) {
            return stateContext.getStateChangeStack().undo();
        }
    }

    public static class Redo extends Message implements IApplicable {
        Redo(Type type) {
            super(Type.InternalType.REDO);
        }

        public boolean isValid(StateContext stateContext) {
            if (!stateContext.getStateChangeStack().canRedo())
                throw new RuntimeException("can not redo");
            return true;
        }

        public Message apply(StateContext stateContext) {
            return stateContext.getStateChangeStack().redo();
        }
    }

    public static class FeatureAdd extends Message implements IUndoable {
        private String belowFeature;

        public FeatureAdd(String belowFeature) {
            super(FeatureIDEEvent.EventType.FEATURE_ADD);
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
            super(FeatureIDEEvent.EventType.FEATURE_ADD_ABOVE);
            this.aboveFeatures = aboveFeatures;
        }

        public boolean isValid(StateContext stateContext) {
            for (String aboveFeature : aboveFeatures)
                FeatureUtils.requireFeature(stateContext.getFeatureModel(), aboveFeature);
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

    public static class FeatureDelete extends Message implements IUndoable {
        private String feature;

        public FeatureDelete(String feature) {
            super(FeatureIDEEvent.EventType.FEATURE_DELETE);
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

    public static class FeatureNameChanged extends Message implements IUndoable {
        private String oldFeature, newFeature;

        public FeatureNameChanged(String oldFeature, String newFeature) {
            super(FeatureIDEEvent.EventType.FEATURE_DELETE);
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
