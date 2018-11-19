package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.messaging.MessageSerializer;
import org.pmw.tinylog.Logger;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.EOFException;
import java.io.IOException;

@ServerEndpoint(
        value = "/websocket",
        encoders = MessageSerializer.MessageEncoder.class,
        decoders = MessageSerializer.MessageDecoder.class)
public class WebSocket {
    private Session session;

    @OnOpen
    public void onOpen(Session session) {
        try {
            Logger.debug("WebSocket opened");
            this.session = session;
            session.setMaxIdleTimeout(0); // this is not always respected by the servlet container!

            try {
                UserManager.getInstance().register(this);
            } catch (Throwable t) {
                send(new Api.Error(t));
            }
        } catch (Throwable t) {
            Logger.error(t);
        }
    }

    @OnClose
    public void onClose() {
        try {
            Logger.debug("WebSocket closed");
            try {
                UserManager.getInstance().unregister(this);
            } catch (Throwable t) {
                send(new Api.Error(t));
            }
        } catch (Throwable t) {
            Logger.error(t);
        }
    }

    @OnMessage
    public void onMessage(Message message) {
        try {
            Logger.debug("WebSocket received {}", message);
            UserManager.getInstance().onMessage(this, message);
        } catch (Throwable t) {
            send(new Api.Error(t));
        }
    }

    @OnError
    public void onError(Throwable t) {
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

    public void send(Message.IEncodable message) {
        try {
            Logger.debug("WebSocket sending {}", message);
            session.getBasicRemote().sendObject(message);
        } catch (IOException | EncodeException e) {
            throw new RuntimeException(e);
        }
    }
}