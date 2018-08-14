package de.ovgu.spldev.varied;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.EOFException;
import java.io.IOException;
import java.util.UUID;

/**
 * An endpoint is a client that has a bidirectional connection (session) with the server.
 */
abstract public class Endpoint {
    protected String label;
    protected Session session;

    public void onOpen() {
        try {
            EndpointManager.getInstance().register(this);
            CollaborationSession.getInstance().subscribe(this);
        } catch (Throwable t) {
            send(new Message.Error(t));
        }
    }

    @OnClose
    public void onClose() {
        try {
            CollaborationSession.getInstance().unsubscribe(this);
            EndpointManager.getInstance().unregister(this);
        } catch (Throwable t) {
            send(new Message.Error(t));
        }
    }

    @OnMessage
    public void onMessage(Message message) {
        try {
            CollaborationSession.getInstance().onMessage(this, message);
        } catch (Throwable t) {
            send(new Message.Error(t));
        }
    }

    @OnError
    public void onError(Throwable t) throws Throwable {
        // Most likely cause is a user closing their browser. Check to see if
        // the root cause is EOF and if it is ignore it.
        // Protect against infinite loops. (see Apache Tomcat examples)
        int count = 0;
        Throwable root = t;
        while (root.getCause() != null && count < 20) {
            root = root.getCause();
            count++;
        }
        // If this is triggered by the user closing their browser ignore it. Else, close the socket.
        if (!(root instanceof EOFException)) {
            t.printStackTrace();
            session.close(new CloseReason(CloseReason.CloseCodes.CLOSED_ABNORMALLY, t.toString()));
        }
    }

    public void send(Message message) {
        try {
            session.getBasicRemote().sendObject(message);
        } catch (IOException | EncodeException e) {
            throw new RuntimeException(e);
        }
    }

    public String getLabel() {
        return label;
    }

    public String toString() {
        return getLabel();
    }

    @ServerEndpoint(
            value = "/{label}",
            encoders = MessageSerializer.MessageEncoder.class,
            decoders = MessageSerializer.MessageDecoder.class)
    public static class LabeledEndpoint extends Endpoint {
        @OnOpen
        public void onOpen(Session session, @PathParam("label") String label) {
            this.session = session;
            this.label = label;
            onOpen();
        }
    }

    @ServerEndpoint(
            value = "/",
            encoders = MessageSerializer.MessageEncoder.class,
            decoders = MessageSerializer.MessageDecoder.class)
    public static class AnonymousEndpoint extends Endpoint {
        @OnOpen
        public void onOpen(Session session) {
            this.session = session;
            this.label = UUID.randomUUID().toString();
            onOpen();
        }
    }
}