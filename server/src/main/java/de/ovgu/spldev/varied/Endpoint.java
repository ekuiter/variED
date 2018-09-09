package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.messaging.MessageSerializer;
import me.atrox.haikunator.Haikunator;
import me.atrox.haikunator.HaikunatorBuilder;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.EOFException;
import java.io.IOException;

/**
 * An endpoint is a client that has a bidirectional connection (session) with the server.
 */
@ServerEndpoint(
        value = "/websocket",
        encoders = MessageSerializer.MessageEncoder.class,
        decoders = MessageSerializer.MessageDecoder.class)
public class Endpoint {
    protected String label;
    protected Session session;

    private static Haikunator haikunator = new HaikunatorBuilder().setDelimiter(" ").setTokenLength(0).build();

    public static String generateLabel() {
        return haikunator.haikunate() + " (anonymous)";
    }

    @OnOpen
    public void onOpen(Session session) {
        EndpointManager endpointManager = EndpointManager.getInstance();
        session.setMaxIdleTimeout(0);

        this.session = session;
        this.label = generateLabel();
        while (!endpointManager.isLabelAvailable(this.label))
            this.label = generateLabel();

        try {
            endpointManager.register(this);
            CollaborationSession.getInstance().subscribe(this);
        } catch (Throwable t) {
            send(new Api.Error(t));
        }
    }

    @OnClose
    public void onClose() {
        try {
            CollaborationSession.getInstance().unsubscribe(this);
            EndpointManager.getInstance().unregister(this);
        } catch (Throwable t) {
            send(new Api.Error(t));
        }
    }

    @OnMessage
    public void onMessage(Message message) {
        try {
            CollaborationSession.getInstance().onMessage(this, message);
        } catch (Throwable t) {
            send(new Api.Error(t));
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

    public void send(Message.IEncodable message) {
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
}