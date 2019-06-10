package de.ovgu.spldev.varied.messaging;

import com.google.gson.annotations.Expose;
import de.ovgu.spldev.varied.Artifact;
import de.ovgu.spldev.varied.Collaborator;
import org.pmw.tinylog.Logger;

import java.util.Collection;
import java.util.UUID;

/**
 * To add a new kind of message: Add a type below and create a camel-cased inner class
 * that derives Message.IEncodable or Message.IDecodable. Possibly also add an operation.
 */
public class Api {
    /**
     * Types of messages. Decodable message types can also be decoded and are registered with Gson.
     */
    public enum TypeEnum {
        ERROR,
        RESET,
        ADD_ARTIFACT,
        REMOVE_ARTIFACT,
        COLLABORATOR_JOINED,
        COLLABORATOR_LEFT,
        SET_USER_PROFILE,
        JOIN_REQUEST,
        LEAVE_REQUEST,
        INITIALIZE,
        KERNEL,
        VOTERS,
        VOTE,
        RESOLUTION_OUTCOME,
        SET_VOTING_STRATEGY
    }

    public static class Error extends Message implements Message.IEncodable {
        @Expose
        String error;

        public Error(Throwable throwable) {
            super(TypeEnum.ERROR, null);
            this.error = throwable.toString();
            Logger.error(throwable);
        }
    }

    public static class Reset extends Message implements Message.IDecodable {
    }

    public static class AddArtifact extends Message implements Message.IEncodable, Message.IDecodable {
        @Expose
        public String source;

        @Expose
        public Artifact.Path[] artifactPaths;

        public AddArtifact(Collection<Artifact.Path> artifactPaths) {
            super(TypeEnum.ADD_ARTIFACT, null);
            this.artifactPaths = artifactPaths.toArray(new Artifact.Path[]{});
        }
    }

    public static class RemoveArtifact extends Message implements Message.IEncodable, Message.IDecodable {
        public RemoveArtifact(de.ovgu.spldev.varied.Artifact.Path artifactPath) {
            super(TypeEnum.REMOVE_ARTIFACT, artifactPath);
        }
    }

    public static class CollaboratorJoined extends Message implements Message.IEncodable {
        @Expose
        Collaborator collaborator;

        public CollaboratorJoined(de.ovgu.spldev.varied.Artifact.Path artifactPath, Collaborator collaborator) {
            super(TypeEnum.COLLABORATOR_JOINED, artifactPath);
            this.collaborator = collaborator;
        }
    }

    public static class CollaboratorLeft extends Message implements Message.IEncodable {
        @Expose
        Collaborator collaborator;

        public CollaboratorLeft(de.ovgu.spldev.varied.Artifact.Path artifactPath, Collaborator collaborator) {
            super(TypeEnum.COLLABORATOR_LEFT, artifactPath);
            this.collaborator = collaborator;
        }
    }

    public static class SetUserProfile extends Message implements Message.IDecodable {
        @Expose
        public String name;
    }

    public static class JoinRequest extends Message implements Message.IDecodable {
    }

    public static class LeaveRequest extends Message implements Message.IDecodable {
    }

    public static class Initialize extends Message implements  Message.IEncodable {
        @Expose
        Object context;

        public Initialize(Artifact.Path artifactPath, Object context) {
            super(TypeEnum.INITIALIZE, artifactPath);
            this.context = context;
        }
    }

    public static class Kernel extends Message implements Message.IEncodable, Message.IDecodable {
        @Expose
        public String message;

        public Kernel(Artifact.Path artifactPath, String message) {
            super(TypeEnum.KERNEL, artifactPath);
            this.message = message;
        }
    }

    public static class Voters extends Message implements Message.IEncodable {
        @Expose
        public UUID[] siteIDs;

        public Voters(Artifact.Path artifactPath, Collection<Collaborator> collaborators) {
            super(TypeEnum.VOTERS, artifactPath);
            this.siteIDs = collaborators.stream()
                    .map(Collaborator::getSiteID)
                    .toArray(UUID[]::new);
        }
    }

    public static class Vote extends Message implements Message.IEncodable, Message.IDecodable {
        @Expose
        public UUID siteID;

        @Expose
        public String versionID;

        public Vote(Artifact.Path artifactPath, Collaborator collaborator, String versionID) {
            super(TypeEnum.VOTE, artifactPath);
            this.siteID = collaborator.getSiteID();
            this.versionID = versionID;
        }
    }

    public static class ResolutionOutcome extends Message implements Message.IEncodable {
        @Expose
        public String versionID;

        public ResolutionOutcome(Artifact.Path artifactPath, String versionID) {
            super(TypeEnum.RESOLUTION_OUTCOME, artifactPath);
            this.versionID = versionID;
        }
    }

    public static class SetVotingStrategy extends Message implements Message.IDecodable {
        @Expose
        public String votingStrategy;
    }
}
