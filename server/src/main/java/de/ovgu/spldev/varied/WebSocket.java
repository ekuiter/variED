package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.messaging.MessageSerializer;
import org.pmw.tinylog.Logger;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.EOFException;
import java.util.UUID;

@ServerEndpoint(
        value = "/websocket/{siteID}", // TODO: add a password that only the site is passed, used to reconnect
        encoders = MessageSerializer.MessageEncoder.class,
        decoders = MessageSerializer.MessageDecoder.class)
public class WebSocket {
    private Session session;
    private UUID siteID;

    // This essentially forces the server to handle only one message at a time.
    // This assumption simplifies multithreaded access to feature models, but limits server performance.
    private static final Object lock = new Object();

    @OnOpen
    public void onOpen(@PathParam("siteID") String _siteID, Session session) {
        synchronized (lock) {
            try {
                Logger.debug("WebSocket opened", siteID);
                this.session = session;
                try {
                    UUID siteID = _siteID.equals("initialize") ? null : UUID.fromString(_siteID);
                    session.setMaxIdleTimeout(0); // this is not always respected by the servlet container!
                    this.siteID = CollaboratorManager.getInstance().register(this, siteID);
                } catch (Throwable t) {
                    send(new Api.Error(t));
                    session.close();
                }
            } catch (Throwable t) {
                Logger.error(t);
            }
        }
    }

    @OnClose
    public void onClose() {
        synchronized (lock) {
            Logger.debug("WebSocket closed for site {}", siteID);
            // TODO: users are not logged out here by default. That means users are indefinitely
            // maintained if they do not properly leave a collaborative session. They should
            // be removed and kernel-GC'ed after a timeout has passed, allowing some offline
            // editing period, and while they are offline, shown as "inactive" in the UI.
            // UPDATE: changed this for the meantime, does not allow offline editing at all
            CollaboratorManager.getInstance().unregister(siteID);
        }
    }

    @OnMessage
    public void onMessage(Message message) {
        synchronized (lock) {
            try {
                try {
                    CollaboratorManager.getInstance().onMessage(siteID, message);
                } catch (Throwable t) {
                    send(new Api.Error(t));
                }
            } catch (SendException e) {
                Logger.error(e);
            }
        }
    }

    @OnError
    public void onError(Throwable t) {
        synchronized (lock) {
            try {
                Logger.debug("WebSocket error:");
                Logger.debug(t);
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
                    Logger.debug("closing WebSocket due to unexpected error");
                    session.close(new CloseReason(CloseReason.CloseCodes.CLOSED_ABNORMALLY, t.toString()));
                }
            } catch (Throwable t2) {
                Logger.error(t2);
            }
        }
    }

    void send(Message.IEncodable message) throws SendException {
        try {
            session.getBasicRemote().sendObject(message);
        } catch (Exception e) {
            throw new SendException(e);
        }
    }

    static class SendException extends Exception {
        SendException(Throwable cause) {
            super(cause);
        }
    }
}