package de.ovgu.spldev.varied.messaging;

import com.google.gson.typeadapters.RuntimeTypeAdapterFactory;
import de.ovgu.spldev.varied.StateContext;
import de.ovgu.spldev.varied.util.StringUtils;
import de.ovgu.spldev.varied.statechanges.StateChange;

import java.util.stream.Stream;

/**
 * Messages exchanged over web sockets.
 */
abstract public class Message {
    public static class Type {
        private Api.TypeEnum typeEnum;

        private Type(Api.TypeEnum typeEnum) {
            this.typeEnum = typeEnum;
        }

        public Type(String s) {
            try {
                this.typeEnum = Api.TypeEnum.valueOf(s);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("invalid message type " + s);
            }
        }

        public String toString() {
            return typeEnum.toString();
        }

        private static String[] getTypes() {
            return Stream.of(Api.TypeEnum.values()).map(Api.TypeEnum::toString).toArray(String[]::new);
        }

        public static RuntimeTypeAdapterFactory<Message> registerSubtypes(RuntimeTypeAdapterFactory<Message> runtimeTypeAdapterFactory) {
            for (String type : getTypes())
                try {
                    Class klass = Class.forName(StringUtils.toClassName(Api.class.getName() + "$", type));
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

    Message(Api.TypeEnum typeEnum) {
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
}