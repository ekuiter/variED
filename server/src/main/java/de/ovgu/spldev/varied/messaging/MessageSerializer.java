package de.ovgu.spldev.varied.messaging;

import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import com.google.gson.typeadapters.RuntimeTypeAdapterFactory;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.Artifact;

import javax.websocket.Decoder;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;
import java.lang.reflect.Type;

/**
 * Utilities for serializing messages.
 */
public class MessageSerializer {
    /**
     * register message class hierarchy with GSON
     */
    private static RuntimeTypeAdapterFactory<Message> runtimeTypeAdapterFactory =
            Message.Type.registerSubtypes(RuntimeTypeAdapterFactory.of(Message.class, "type", true));

    /**
     * type hint for GSON
     */
    private static TypeToken<Message> typeToken = new TypeToken<Message>() {
    };

    /**
     * GSON facilitates JSON serialization
     */
    private static Gson gson = new GsonBuilder()
            .registerTypeAdapterFactory(runtimeTypeAdapterFactory)
            .registerTypeAdapter(Message.Type.class, new MessageTypeTypeAdapter())
            .registerTypeAdapter(IFeatureModel.class, new FeatureModelSerializer())
            .create();

    /**
     * instructs Java's WebSocket library to encode messages with JSON
     */
    public static class MessageEncoder implements Encoder.Text<Message> {
        public String encode(Message message) {
            return gson.toJson(message);
        }

        public void init(EndpointConfig endpointConfig) {
        }

        public void destroy() {
        }
    }

    /**
     * decodes message objects from JSON (respecting the polymorphic class hierarchy)
     */
    public static class MessageDecoder implements Decoder.Text<Message> {
        public Message decode(String s) {
            return gson.fromJson(s, typeToken.getType());
        }

        public boolean willDecode(String s) {
            return s != null;
        }

        public void init(EndpointConfig endpointConfig) {
        }

        public void destroy() {
        }
    }

    private static class MessageTypeTypeAdapter implements JsonSerializer<Message.Type>, JsonDeserializer<Message.Type> {
        public JsonElement serialize(Message.Type src, Type typeOfSrc, JsonSerializationContext context) {
            return new JsonPrimitive(src.toString());
        }

        public Message.Type deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
            return new Message.Type(json.getAsJsonPrimitive().getAsString());
        }
    }
}
