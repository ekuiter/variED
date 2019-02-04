package de.ovgu.spldev.varied;

import com.google.gson.annotations.Expose;
import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;
import me.atrox.haikunator.Haikunator;
import me.atrox.haikunator.HaikunatorBuilder;
import org.pmw.tinylog.Logger;

import java.util.*;

public class Collaborator {
    @Expose
    private UUID siteID;

    @Expose
    private String name;

    private WebSocket webSocket;
    private Queue<Message.IEncodable> outgoingQueue = new LinkedList<>();

    private static Haikunator haikunator = new HaikunatorBuilder().setDelimiter(" ").setTokenLength(0).build();
    private Set<CollaborativeSession> collaborativeSessions = new HashSet<>();
    private static final Object lock = new Object();

    private static String generateName() {
        return haikunator.haikunate() + " (anonymous)";
    }

    Collaborator(WebSocket webSocket) {
        this(UUID.randomUUID(), generateName(), webSocket);
    }

    private Collaborator(UUID siteID, String name, WebSocket webSocket) {
        this.siteID = siteID;
        this.name = name;
        this.webSocket = webSocket;
    }

    private void _send(Message.IEncodable message) throws WebSocket.SendException {
        Logger.info("sending message {} to collaborator {}", message, this);
        webSocket.send(message);
    }

    void sendPending() {
        Logger.info("sending {} queued messages to collaborator {}", outgoingQueue.size(), this);
        while (outgoingQueue.peek() != null) {
            Message.IEncodable message = outgoingQueue.peek();
            try {
                _send(message);
            } catch (WebSocket.SendException e) {
                return;
            }
            outgoingQueue.remove();
        }
    }

    void send(Message.IEncodable message) {
        Logger.info("queueing message {} for collaborator {}", message, this);
        outgoingQueue.add(message);
        sendPending();
    }

    void sendInitialInformation() {
        Logger.info("sending initial information to collaborator {}", this);
        send(new Api.CollaboratorInfo(siteID));
        for (Artifact artifact : ProjectManager.getInstance().getArtifacts())
            send(new Api.ArtifactInfo(artifact.getPath()));
    }

    public String getName() {
        return name;
    }

    UUID getSiteID() {
        return siteID;
    }

    public String toString() {
        return getSiteID().toString();
    }

    public void setWebSocket(WebSocket webSocket) {
        this.webSocket = webSocket;
    }

    void onMessage(Message message) throws Message.InvalidMessageException {
        Objects.requireNonNull(message, "no message given");
        Logger.info("received message {} from collaborator {}", message, this);

        if (message.getArtifactPath() == null)
            throw new Message.InvalidMessageException("no artifact path given");

        // This essentially forces the server to handle only one message at a time.
        // This assumption simplifies multithreaded access to feature models, but limits server performance.
        synchronized (lock) {
            Logger.debug("entering locked region");
            try {
                Artifact artifact = ProjectManager.getInstance().getArtifact(message.getArtifactPath());
                if (artifact == null)
                    throw new Message.InvalidMessageException("no artifact found for path " + message.getArtifactPath());
                CollaborativeSession collaborativeSession = artifact.getCollaborativeSession();
                Logger.debug("message concerns collaborative session {}", collaborativeSession);

                if (message.isType(Api.TypeEnum.JOIN_REQUEST) || message.isType(Api.TypeEnum.LEAVE_REQUEST)) {
                    if (message.isType(Api.TypeEnum.JOIN_REQUEST))
                        joinCollaborativeSession(collaborativeSession);
                    if (message.isType(Api.TypeEnum.LEAVE_REQUEST))
                        leaveCollaborativeSession(collaborativeSession);
                    return;
                }

                for (CollaborativeSession _collaborativeSession : collaborativeSessions)
                    if (_collaborativeSession == collaborativeSession) {
                        collaborativeSession.onMessage(this, message);
                        return;
                    }
            } finally {
                Logger.debug("leaving locked region");
            }
        }

        throw new Message.InvalidMessageException("did not join collaborative session for given artifact path");
    }

    public void joinCollaborativeSession(CollaborativeSession collaborativeSession) {
        collaborativeSession.join(this);
        collaborativeSessions.add(collaborativeSession);
    }

    public void leaveCollaborativeSession(CollaborativeSession collaborativeSession) {
        collaborativeSession.leave(this);
        collaborativeSessions.remove(collaborativeSession);
    }

    public void leaveAllCollaborativeSessions() {
        for (CollaborativeSession collaborativeSession : collaborativeSessions)
            collaborativeSession.leave(this);
        collaborativeSessions.clear();
    }
}
