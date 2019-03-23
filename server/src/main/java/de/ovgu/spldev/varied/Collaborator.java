package de.ovgu.spldev.varied;

import com.google.common.io.Resources;
import com.google.gson.annotations.Expose;
import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;
import me.atrox.haikunator.Haikunator;
import me.atrox.haikunator.HaikunatorBuilder;
import org.pmw.tinylog.Logger;

import java.net.URISyntaxException;
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
        Logger.info("sending {} message to collaborator {}", ((Message) message).getType(), this);
        webSocket.send(message);
    }

    void sendPending() {
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

    public void send(Message.IEncodable message) {
        outgoingQueue.add(message);
        sendPending();
    }

    void sendInitialInformation() {
        Logger.info("sending initial information to collaborator {}", this);
        send(new Api.CollaboratorInfo(siteID));
        send(new Api.AddArtifact(ProjectManager.getInstance().getArtifactPaths()));
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
        Logger.info("received {} message from collaborator {}", message.getType(), this);

        Artifact.Path artifactPath = message.getArtifactPath();
        if (artifactPath == null)
            throw new Message.InvalidMessageException("no artifact path given");

        if (message.isType(Api.TypeEnum.ADD_ARTIFACT)) {
            Logger.info("adding new artifact {}", artifactPath);
            if (ProjectManager.getInstance().getArtifact(artifactPath) != null)
                throw new RuntimeException("artifact for path " + artifactPath + " already exists");
            Project project = ProjectManager.getInstance().getProject(artifactPath);
            if (project == null) {
                String projectName = artifactPath.getProjectName();
                Logger.info("adding new project {}", projectName);
                project = new Project(projectName);
                ProjectManager.getInstance().addProject(project);
            }
            String source = ((Api.AddArtifact) message).source;
            Artifact artifact;
            if (source == null) {
                try {
                    artifact = new Artifact.FeatureModel(project, artifactPath.getArtifactName(),
                            Resources.getResource("examples/" + ProjectManager.EMPTY + ".xml"));
                } catch (URISyntaxException e) {
                    throw new RuntimeException("invalid resource path given");
                }
            } else
                artifact = new Artifact.FeatureModel(project, artifactPath.getArtifactName(), source);
            project.addArtifact(artifact);
            CollaboratorManager.getInstance().broadcast(new Api.AddArtifact(Arrays.asList(artifactPath)));
            return;
        }

        if (message.isType(Api.TypeEnum.REMOVE_ARTIFACT)) {
            Logger.info("removing artifact {}", artifactPath);
            Artifact artifact = ProjectManager.getInstance().getArtifact(artifactPath);
            if (artifact == null)
                throw new RuntimeException("no artifact found for path " + artifactPath);
            if (artifact.getCollaborativeSession().isInProcess())
                throw new RuntimeException("collaborative session for artifact is still in process");
            ProjectManager.getInstance().getProject(artifactPath).removeArtifact(artifact);
            CollaboratorManager.getInstance().broadcast(new Api.RemoveArtifact(artifactPath));
            return;
        }

        Artifact artifact = ProjectManager.getInstance().getArtifact(artifactPath);
        if (artifact == null)
            throw new Message.InvalidMessageException("no artifact found for path " + artifactPath);
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

        throw new Message.InvalidMessageException("did not join collaborative session for given artifact path");
    }

    private void joinCollaborativeSession(CollaborativeSession collaborativeSession) {
        collaborativeSession.join(this);
        collaborativeSessions.add(collaborativeSession);
    }

    private void leaveCollaborativeSession(CollaborativeSession collaborativeSession) {
        collaborativeSession.leave(this);
        collaborativeSessions.remove(collaborativeSession);
    }

    public void leaveAllCollaborativeSessions() {
        for (CollaborativeSession collaborativeSession : collaborativeSessions)
            collaborativeSession.leave(this);
        collaborativeSessions.clear();
    }
}
