package de.ovgu.spldev.varied.messaging;

import com.google.gson.annotations.Expose;
import de.ovgu.spldev.varied.Artifact;
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
        ADD_ARTIFACT,
        REMOVE_ARTIFACT,
        COLLABORATOR_INFO,
        JOIN_REQUEST,
        LEAVE_REQUEST,
        INITIALIZE,
        KERNEL
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

    public static class Error extends Message implements Message.IEncodable {
        @Expose
        String error;

        public Error(Throwable throwable) {
            super(TypeEnum.ERROR, null);
            this.error = throwable.toString();
            Logger.error(throwable);
        }
    }

    public static class CollaboratorInfo extends Message implements Message.IEncodable {
        @Expose
        UUID siteID;

        public CollaboratorInfo(UUID siteID) {
            super(TypeEnum.COLLABORATOR_INFO, null);
            this.siteID = siteID;
        }
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
}
