package de.ovgu.spldev.varied;

import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.IFeatureModelFactory;
import de.ovgu.featureide.fm.core.base.impl.DefaultFeatureModelFactory;
import de.ovgu.featureide.fm.core.base.impl.FeatureModel;
import de.ovgu.spldev.varied.kernel.Kernel;
import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.util.CollaboratorUtils;
import de.ovgu.spldev.varied.util.FeatureModelUtils;
import org.pmw.tinylog.Logger;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
        CollaboratorUtils.broadcastToOtherCollaborators(collaborators, new Api.CollaboratorJoined(artifactPath, newCollaborator), newCollaborator);
        CollaboratorUtils.sendForEveryCollaborator(newCollaborator, collaborators, collaborator -> new Api.CollaboratorJoined(artifactPath, collaborator));
    }

    public void leave(Collaborator oldCollaborator) {
        Logger.info("{} leaves collaborative session {}", oldCollaborator, this);
        if (!collaborators.remove(oldCollaborator))
            throw new RuntimeException("collaborator already left");
        _leave(oldCollaborator);
        CollaboratorUtils.broadcastToOtherCollaborators(collaborators, new Api.CollaboratorLeft(artifactPath, oldCollaborator), oldCollaborator);
    }

    void onMessage(Collaborator collaborator, Message message) throws Message.InvalidMessageException {
        if (!_onMessage(collaborator, (Message.IDecodable) message))
            throw new Message.InvalidMessageException("message can not be processed");
    }

    static class FeatureModel extends CollaborativeSession {
        private Kernel kernel;
        private String votingStrategy = "consensus";
        private boolean onlyInvolved = false;
        private VotingPhase votingPhase;

        FeatureModel(Artifact.Path artifactPath, IFeatureModel initialFeatureModel) {
            super(artifactPath);
            Objects.requireNonNull(initialFeatureModel, "no initial feature model given");
            this.kernel = new Kernel(artifactPath, initialFeatureModel);
        }

        public IFeatureModel toFeatureModel() {
            return kernel.toFeatureModel();
        }

        private void broadcastResponse(Collaborator collaborator, Object[] involvedSiteIDsAndMessage) {
            String[] involvedSiteIDs = (String[]) involvedSiteIDsAndMessage[0];
            String newMessage = (String) involvedSiteIDsAndMessage[1];
            CollaboratorUtils.broadcastToOtherCollaborators(collaborators, new Api.Kernel(artifactPath, newMessage), collaborator);
            if (involvedSiteIDs != null && votingPhase == null) {
                Logger.info("{} collaborators involved in the conflict", involvedSiteIDs.length);
                Collection<Collaborator> involvedCollaborators =
                        Stream.of(involvedSiteIDs)
                            .map(siteID -> collaborators.stream()
                                    .filter(_collaborator -> _collaborator.getSiteID().equals(UUID.fromString(siteID)))
                                    .findFirst()
                                    .get())
                            .collect(Collectors.toCollection(HashSet::new));
                votingPhase = new VotingPhase(VotingPhase.VotingStrategy.createInstance(
                        votingStrategy, onlyInvolved, collaborators, involvedCollaborators));
                broadcastVoters();
                updateVotingPhase();
            }
        }

        void broadcastVoters() {
            CollaboratorUtils.broadcast(collaborators, new Api.Voters(artifactPath, votingPhase.getVoters()));
        }

        void updateVotingPhase() {
            String electedVersionID = votingPhase.getElectedVersionID();
            if (electedVersionID != null) {
                votingPhase = null;
                kernel.resolveConflict(electedVersionID);
                CollaboratorUtils.broadcast(collaborators, new Api.ResolutionOutcome(artifactPath, electedVersionID));
            }
        }

        protected boolean _onMessage(Collaborator collaborator, Message.IDecodable message) {
            if (message instanceof Api.Kernel) {
                broadcastResponse(collaborator, kernel.forwardMessage(((Api.Kernel) message).message));
                return true;
            }

            if (message instanceof Api.SetVotingStrategy) {
                if (votingPhase != null)
                    throw new RuntimeException("can not change voting strategy while in voting phase");
                String votingStrategy = ((Api.SetVotingStrategy) message).votingStrategy;
                boolean onlyInvolved = ((Api.SetVotingStrategy) message).onlyInvolved;
                Logger.info("setting voting strategy to {} ({})", votingStrategy, onlyInvolved ? "only involved" : "everyone");
                this.votingStrategy = votingStrategy;
                this.onlyInvolved = onlyInvolved;
                return true;
            }

            if (message instanceof Api.Vote) {
                if (votingPhase == null)
                    throw new RuntimeException("not currently in voting phase");
                if (!votingPhase.isEligible(collaborator))
                    throw new RuntimeException("not eligible for voting");

                Api.Vote voteMessage = (Api.Vote) message;
                voteMessage.siteID = collaborator.getSiteID();
                CollaboratorUtils.broadcast(collaborators, voteMessage);
                votingPhase.vote(collaborator, voteMessage.versionID);
                updateVotingPhase();
                return true;
            }

            if (message instanceof Api.ExportArtifact) {
                Api.ExportArtifact exportArtifactMessage = (Api.ExportArtifact) message;
                exportArtifactMessage.data = FeatureModelUtils.serializeFeatureModel(toFeatureModel(), exportArtifactMessage.format);
                collaborator.send(exportArtifactMessage);
            }

            return false;
        }

        protected void _join(Collaborator newCollaborator) {
            UUID siteID = newCollaborator.getSiteID();
            String[] contextAndHeartbeatMessage = kernel.siteJoined(siteID);
            String context = contextAndHeartbeatMessage[0],
                    heartbeatMessage = contextAndHeartbeatMessage[1];
            newCollaborator.send(new Api.Initialize(artifactPath, context));
            CollaboratorUtils.broadcastToOtherCollaborators(collaborators, new Api.Kernel(artifactPath, heartbeatMessage), newCollaborator);
            if (votingPhase != null) {
                votingPhase.onJoin(newCollaborator);
                broadcastVoters();
                for (Map.Entry<Collaborator, String> entry : votingPhase.getVoteResults().entrySet())
                    newCollaborator.send(new Api.Vote(artifactPath, entry.getKey(), entry.getValue()));
                updateVotingPhase();
            }
        }

        protected void _leave(Collaborator oldCollaborator) {
            if (votingPhase != null) {
                votingPhase.onLeave(oldCollaborator);
                broadcastVoters();
                updateVotingPhase();
            }
            broadcastResponse(oldCollaborator, kernel.siteLeft(oldCollaborator.getSiteID()));
        }
    }
}
