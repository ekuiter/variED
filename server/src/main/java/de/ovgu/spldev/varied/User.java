package de.ovgu.spldev.varied;

import com.google.gson.annotations.Expose;
import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;
import me.atrox.haikunator.Haikunator;
import me.atrox.haikunator.HaikunatorBuilder;
import org.pmw.tinylog.Logger;

import java.util.ArrayList;
import java.util.Objects;
import java.util.function.Supplier;

public class User {
    @Expose
    private String name;

    private WebSocket webSocket;
    private static Haikunator haikunator = new HaikunatorBuilder().setDelimiter(" ").setTokenLength(0).build();
    private ArrayList<CollaborativeSession> collaborativeSessions = new ArrayList<>();
    private static final Object lock = new Object();

    private static String generateName() {
        Supplier<String> generator = () -> haikunator.haikunate() + " (anonymous)";
        UserManager userManager = UserManager.getInstance();
        String name = generator.get();
        while (!userManager.isNameAvailable(name))
            name = generator.get();
        return name;
    }

    public User(WebSocket webSocket) {
        this(generateName(), webSocket);
    }

    public User(String name, WebSocket webSocket) {
        this.name = name;
        this.webSocket = webSocket;
    }

    public void send(Message.IEncodable message) {
        Logger.info("sending message {} to user {}", message, this);
        webSocket.send(message);
    }

    public void sendInitialInformation() {
        Logger.info("sending initial information to user {}", this);
        send(new Api.UserInfo(this));
        for (Artifact artifact : ProjectManager.getInstance().getArtifacts())
            send(new Api.ArtifactInfo(artifact.getPath()));
    }

    public String getName() {
        return name;
    }

    public WebSocket getWebSocket() {
        return webSocket;
    }

    public String toString() {
        return getName();
    }

    public void onMessage(Message message) {
        Objects.requireNonNull(message, "no message given");
        Logger.info("received message {} from user {}", message, this);

        if (message.getArtifactPath() == null)
            throw new RuntimeException("no artifact path given");

        // This essentially forces the server to handle only one message at a time.
        // This assumption simplifies multithreaded access to feature models, but limits server performance.
        synchronized (lock) {
            Logger.debug("entering locked region");
            try {
                Artifact artifact = ProjectManager.getInstance().getArtifact(message.getArtifactPath());
                if (artifact == null)
                    throw new RuntimeException("no artifact found for path " + message.getArtifactPath());
                CollaborativeSession collaborativeSession = artifact.getCollaborativeSession();
                Logger.debug("message concerns collaborative session {}", collaborativeSession);

                if (message.isType(Api.TypeEnum.JOIN) || message.isType(Api.TypeEnum.LEAVE)) {
                    if (message.isType(Api.TypeEnum.JOIN))
                        joinCollaborativeSession(collaborativeSession);
                    if (message.isType(Api.TypeEnum.LEAVE))
                        leaveCollaborativeSession(collaborativeSession);
                    return;
                }

                for (CollaborativeSession _collaborativeSession : collaborativeSessions)
                    if (_collaborativeSession == collaborativeSession) {
                        collaborativeSession.onMessage(message);
                        return;
                    }
            } finally {
                Logger.debug("leaving locked region");
            }
        }

        throw new RuntimeException("did not join collaborative session for given artifact path");
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
