package de.ovgu.spldev.varied;

import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.kernel.Kernel;
import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.util.CollaboratorUtils;
import org.pmw.tinylog.Logger;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/**
 * A collaborative session consists of a set of collaborators that view and edit a artifact together.
 */
public abstract class CollaborativeSession {
    protected Artifact.Path artifactPath;
    protected Set<Collaborator> collaborators = new HashSet<>();

    CollaborativeSession(Artifact.Path artifactPath) {
        this.artifactPath = artifactPath;
    }

    public String toString() {
        return artifactPath.toString();
    }

    protected abstract void _join(Collaborator newCollaborator);

    protected abstract void _leave(Collaborator oldCollaborator);

    protected abstract boolean _onMessage(Collaborator collaborator, Message.IDecodable message);

    public boolean isInProcess() {
        return collaborators.size() > 0;
    }

    public void join(Collaborator newCollaborator) {
        Logger.info("{} joins collaborative session {}", newCollaborator, this);
        // collaborator may re-join to obtain new initialization context,
        // therefore do not check "add" return value here
        collaborators.add(newCollaborator);
        _join(newCollaborator);
    }

    public void leave(Collaborator oldCollaborator) {
        Logger.info("{} leaves collaborative session {}", oldCollaborator, this);
        if (!collaborators.remove(oldCollaborator))
            throw new RuntimeException("collaborator already left");
        _leave(oldCollaborator);
    }

    void onMessage(Collaborator collaborator, Message message) throws Message.InvalidMessageException {
        if (!_onMessage(collaborator, (Message.IDecodable) message))
            throw new Message.InvalidMessageException("message can not be processed");
    }

    static class FeatureModel extends CollaborativeSession {
        private Kernel kernel;

        FeatureModel(Artifact.Path artifactPath, IFeatureModel initialFeatureModel) {
            super(artifactPath);
            Objects.requireNonNull(initialFeatureModel, "no initial feature model given");
            this.kernel = new Kernel(artifactPath, initialFeatureModel);
        }

        protected boolean _onMessage(Collaborator collaborator, Message.IDecodable message) {
            if (!(message instanceof Api.Kernel))
                return false;

            Api.Kernel kernelMessage = (Api.Kernel) message;
            String newMessage = kernel.forwardMessage(kernelMessage.message);
            CollaboratorUtils.broadcastToOthers(collaborators, new Api.Kernel(artifactPath, newMessage), collaborator);
            return true;
        }

        protected void _join(Collaborator newCollaborator) {
            UUID siteID = newCollaborator.getSiteID();
            String[] contextAndHeartbeatMessage = kernel.siteJoined(siteID);
            String context = contextAndHeartbeatMessage[0],
                    heartbeatMessage = contextAndHeartbeatMessage[1];
            newCollaborator.send(new Api.Initialize(artifactPath, context));
            CollaboratorUtils.broadcastToOthers(collaborators, new Api.Kernel(artifactPath, heartbeatMessage), newCollaborator);
        }

        protected void _leave(Collaborator oldCollaborator) {
            UUID siteID = oldCollaborator.getSiteID();
            String leaveMessage = kernel.siteLeft(siteID);
            CollaboratorUtils.broadcastToOthers(collaborators, new Api.Kernel(artifactPath, leaveMessage), oldCollaborator);
        }
    }
}
