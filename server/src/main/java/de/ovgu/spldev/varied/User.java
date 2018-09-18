package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;
import me.atrox.haikunator.Haikunator;
import me.atrox.haikunator.HaikunatorBuilder;

import java.util.ArrayList;
import java.util.Objects;
import java.util.function.Supplier;

public class User {
    private String name;
    private WebSocket webSocket;
    private static Haikunator haikunator = new HaikunatorBuilder().setDelimiter(" ").setTokenLength(0).build();
    private ArrayList<CollaborationSession> collaborationSessions = new ArrayList<>();

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
        webSocket.send(message);
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

        if (message.getArtifactPath() == null)
            throw new RuntimeException("no artifact path given");

        Artifact artifact = ProjectManager.getInstance().getArtifact(message.getArtifactPath());
        if (artifact == null)
            throw new RuntimeException("no artifact found for given path");
        CollaborationSession collaborationSession = artifact.getCollaborationSession();

        if (message.isType(Api.TypeEnum.JOIN) || message.isType(Api.TypeEnum.LEAVE)) {
            if (message.isType(Api.TypeEnum.JOIN))
                joinCollaborationSession(collaborationSession);
            if (message.isType(Api.TypeEnum.LEAVE))
                leaveCollaborationSession(collaborationSession);
            return;
        }

        for (CollaborationSession _collaborationSession : collaborationSessions)
            if (_collaborationSession == collaborationSession) {
                collaborationSession.onMessage(message);
                return;
            }

        throw new RuntimeException("did not join collaboration session for given artifact path");
    }

    public void joinCollaborationSession(CollaborationSession collaborationSession) {
        collaborationSession.join(this);
        collaborationSessions.add(collaborationSession);
    }

    public void leaveCollaborationSession(CollaborationSession collaborationSession) {
        collaborationSession.leave(this);
        collaborationSessions.remove(collaborationSession);
    }

    public void leaveAllCollaborationSessions() {
        for (CollaborationSession collaborationSession : collaborationSessions)
            collaborationSession.leave(this);
        collaborationSessions.clear();
    }
}
