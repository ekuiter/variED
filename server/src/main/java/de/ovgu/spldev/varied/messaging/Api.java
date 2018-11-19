package de.ovgu.spldev.varied.messaging;

import com.google.gson.annotations.Expose;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.Artifact;
import de.ovgu.spldev.varied.StateContext;
import de.ovgu.spldev.varied.User;
import de.ovgu.spldev.varied.common.operations.Operation;
import de.ovgu.spldev.varied.common.operations.featurediagram.*;
import de.ovgu.spldev.varied.util.FeatureModelUtils;
import org.pmw.tinylog.Logger;

/**
 * To add a new kind of message: Add a type below and create a camel-cased inner class
 * that derives Message.IEncodable or Message.IDecodable. Possibly also add an operation.
 */
public class Api {
    /**
     * Types of messages. Decodable message types can also be decoded and are registered with Gson.
     */
    public enum TypeEnum {
        ERROR, USER_INFO, ARTIFACT_INFO, JOIN, LEAVE, UNDO, REDO, BATCH,
        FEATURE_DIAGRAM_FEATURE_MODEL,
        FEATURE_DIAGRAM_FEATURE_ADD_BELOW,
        FEATURE_DIAGRAM_FEATURE_ADD_ABOVE,
        FEATURE_DIAGRAM_FEATURE_REMOVE,
        FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW,
        FEATURE_DIAGRAM_FEATURE_RENAME,
        FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION,
        FEATURE_DIAGRAM_FEATURE_SET_PROPERTY
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

    public static class UserInfo extends Message implements Message.IEncodable {
        @Expose
        private User user;

        public UserInfo(User user) {
            super(TypeEnum.USER_INFO, null);
            this.user = user;
        }
    }

    public static class ArtifactInfo extends Message implements Message.IEncodable {
        public ArtifactInfo(Artifact.Path artifactPath) {
            super(TypeEnum.ARTIFACT_INFO, artifactPath);
        }
    }

    public static class Join extends Message implements Message.IEncodable, Message.IDecodable {
        @Expose
        private User user;

        public Join(Artifact.Path artifactPath, User user) {
            super(TypeEnum.JOIN, artifactPath);
            this.user = user;
        }
    }

    public static class Leave extends Message implements Message.IEncodable, Message.IDecodable {
        @Expose
        private User user;

        public Leave(Artifact.Path artifactPath, User user) {
            super(TypeEnum.LEAVE, artifactPath);
            this.user = user;
        }
    }

    public static class Undo extends Message implements Message.IApplicable {
        Undo(Artifact.Path artifactPath) {
            super(TypeEnum.UNDO, artifactPath);
        }

        public boolean isValid(StateContext stateContext) throws InvalidMessageException {
            if (!stateContext.getOperationStack().canUndo())
                throw new InvalidMessageException("can not undo");
            return true;
        }

        public IEncodable[] apply(StateContext stateContext) throws Operation.InvalidOperationException {
            stateContext.getOperationStack().undo();
            return FeatureModelUtils.toMessage((StateContext.FeatureModel) stateContext);
        }
    }

    public static class Redo extends Message implements Message.IApplicable {
        Redo(Artifact.Path artifactPath) {
            super(TypeEnum.REDO, artifactPath);
        }

        public boolean isValid(StateContext stateContext) throws InvalidMessageException {
            if (!stateContext.getOperationStack().canRedo())
                throw new InvalidMessageException("can not redo");
            return true;
        }

        public IEncodable[] apply(StateContext stateContext) throws Operation.InvalidOperationException {
            stateContext.getOperationStack().redo();
            return FeatureModelUtils.toMessage((StateContext.FeatureModel) stateContext);
        }
    }

    /*
    // currently not available.
    public static class Batch extends Message implements Message.IUndoable {
        @Expose
        private Message[] messages;

        public Batch(Artifact.Path artifactPath, Message[] messages) {
            super(TypeEnum.BATCH, artifactPath);
            this.messages = messages;
        }

        public LinkedList<IBatchUndoable> getMessages() {
            LinkedList<IBatchUndoable> messages = new LinkedList<>();
            for (Message message : this.messages) {
                if (!(message instanceof IBatchUndoable))
                    throw new InvalidMessageException("expected batch undoable message, got type " +
                            message.getClass().getName());
                messages.add((IBatchUndoable) message);
            }
            return messages;
        }

        public boolean isValid(StateContext stateContext) {
            if (messages == null || messages.length == 0)
                throw new InvalidMessageException("no messages given");
            Class messageClass = messages[0].getClass();
            for (Message message : messages)
                if (message.getClass() != messageClass)
                    throw new InvalidMessageException("expected type " +
                            messageClass.getName() + ", got type " + message.getClass().getName());

            boolean valid = true;
            for (IBatchUndoable message : getMessages())
                valid = message.isValid(stateContext) && valid;
            return valid;
        }

        public Operation getOperation(StateContext stateContext) {
            return new de.ovgu.spldev.varied.operations.Batch(stateContext, getMessages());
        }

        public IEncodable[] getResponse(StateContext stateContext) {
            return FeatureModelUtils.toMessage((StateContext.FeatureModel) stateContext);
        }
    }*/

    public static class Batch extends Message implements Message.IUndoable {
        @Expose
        private Message[] messages;

        public Batch(Artifact.Path artifactPath, Message[] messages) {
            super(TypeEnum.BATCH, artifactPath);
            this.messages = messages;
        }

        public boolean isValid(StateContext stateContext) throws InvalidMessageException {
            throw new InvalidMessageException("batch messages currently not available");
        }

        public Operation getOperation(StateContext stateContext) {
            return null;
        }
    }

    public static class FeatureDiagramFeatureModel extends Message implements Message.IEncodable {
        @Expose
        private IFeatureModel featureModel;

        public FeatureDiagramFeatureModel(Artifact.Path artifactPath, IFeatureModel featureModel) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_MODEL, artifactPath);
            this.featureModel = featureModel;
        }
    }

    public static class FeatureDiagramFeatureAddBelow extends Message implements Message.IUndoable {
        @Expose
        private String belowFeatureUUID, newFeatureUUID;

        public FeatureDiagramFeatureAddBelow(Artifact.Path artifactPath, String belowFeatureUUID, String uuid) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_ADD_BELOW, artifactPath);
            this.belowFeatureUUID = belowFeatureUUID;
            this.newFeatureUUID = newFeatureUUID;
        }

        public Operation getOperation(StateContext stateContext) throws Operation.InvalidOperationException {
            return new FeatureAddBelow(((StateContext.FeatureModel) stateContext).getFeatureModel(), belowFeatureUUID, newFeatureUUID);
        }

        public IEncodable[] getResponse(StateContext stateContext) {
            return FeatureModelUtils.toMessage((StateContext.FeatureModel) stateContext);
        }
    }

    public static class FeatureDiagramFeatureAddAbove extends Message implements Message.IUndoable {
        @Expose
        private String[] aboveFeatureUUIDs;

        @Expose
        String newFeatureUUID;

        public FeatureDiagramFeatureAddAbove(Artifact.Path artifactPath, String[] aboveFeatureUUIDs, String newFeatureUUID) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_ADD_ABOVE, artifactPath);
            this.aboveFeatureUUIDs = aboveFeatureUUIDs;
            this.newFeatureUUID = newFeatureUUID;
        }

        public Operation getOperation(StateContext stateContext) throws Operation.InvalidOperationException {
            return new FeatureAddAbove(((StateContext.FeatureModel) stateContext).getFeatureModel(), aboveFeatureUUIDs, newFeatureUUID);
        }

        public IEncodable[] getResponse(StateContext stateContext) {
            return FeatureModelUtils.toMessage((StateContext.FeatureModel) stateContext);
        }
    }

    public static class FeatureDiagramFeatureRemove extends Message implements Message.IBatchUndoable {
        @Expose
        private String featureUUID;

        public FeatureDiagramFeatureRemove(Artifact.Path artifactPath, String featureUUID) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_REMOVE, artifactPath);
            this.featureUUID = featureUUID;
        }

        public Operation getOperation(StateContext stateContext) throws Operation.InvalidOperationException {
            return new FeatureRemove(((StateContext.FeatureModel) stateContext).getFeatureModel(), featureUUID);
        }

        public IEncodable[] getResponse(StateContext stateContext) {
            return FeatureModelUtils.toMessage((StateContext.FeatureModel) stateContext);
        }
    }

    public static class FeatureDiagramFeatureRemoveBelow extends Message implements Message.IBatchUndoable {
        @Expose
        private String featureUUID;

        public FeatureDiagramFeatureRemoveBelow(Artifact.Path artifactPath, String featureUUID) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW, artifactPath);
            this.featureUUID = featureUUID;
        }

        public Operation getOperation(StateContext stateContext) throws Operation.InvalidOperationException {
            return getOperation(stateContext, null);
        }

        public Operation getOperation(StateContext stateContext, Object batchContext) throws Operation.InvalidOperationException {
            return new FeatureRemoveBelow(((StateContext.FeatureModel) stateContext).getFeatureModel(), featureUUID, batchContext);
        }

        public Object createBatchContext() {
            return FeatureRemoveBelow.createBatchContext();
        }

        public Object nextBatchContext(Operation operation, Object batchContext) {
            return ((FeatureRemoveBelow) operation).nextBatchContext(batchContext);
        }

        public IEncodable[] getResponse(StateContext stateContext) {
            return FeatureModelUtils.toMessage((StateContext.FeatureModel) stateContext);
        }
    }

    public static class FeatureDiagramFeatureRename extends Message implements Message.IEncodable, Message.IUndoable {
        @Expose
        private String featureUUID, name;

        public FeatureDiagramFeatureRename(Artifact.Path artifactPath, String featureUUID, String name) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_RENAME, artifactPath);
            this.featureUUID = featureUUID;
            this.name = name;
        }

        public Operation getOperation(StateContext stateContext) throws Operation.InvalidOperationException {
            return new FeatureRename(((StateContext.FeatureModel) stateContext).getFeatureModel(), featureUUID, name);
        }

        public IEncodable[] getResponse(StateContext stateContext) {
            return FeatureModelUtils.toMessage((StateContext.FeatureModel) stateContext);
        }
    }

    public static class FeatureDiagramFeatureSetDescription extends Message implements Message.IUndoable {
        @Expose
        private String featureUUID, description;

        public FeatureDiagramFeatureSetDescription(Artifact.Path artifactPath, String featureUUID, String description) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION, artifactPath);
            this.featureUUID = featureUUID;
            this.description = description;
        }

        public Operation getOperation(StateContext stateContext) throws Operation.InvalidOperationException {
            return new FeatureSetDescription(((StateContext.FeatureModel) stateContext).getFeatureModel(), featureUUID, description);
        }

        public IEncodable[] getResponse(StateContext stateContext) {
            return FeatureModelUtils.toMessage((StateContext.FeatureModel) stateContext);
        }
    }

    public static class FeatureDiagramFeatureSetProperty extends Message implements Message.IBatchUndoable {
        @Expose
        private String featureUUID, property, value;

        public FeatureDiagramFeatureSetProperty(Artifact.Path artifactPath, String featureUUID, String property, String value) {
            super(TypeEnum.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, artifactPath);
            this.featureUUID = featureUUID;
            this.property = property;
            this.value = value;
        }

        public Operation getOperation(StateContext stateContext) throws Operation.InvalidOperationException {
            return getOperation(stateContext, null);
        }

        public Operation getOperation(StateContext stateContext, Object batchContext) throws Operation.InvalidOperationException {
            return new FeatureSetProperty(((StateContext.FeatureModel) stateContext).getFeatureModel(), featureUUID, property, value, batchContext);
        }

        public Object createBatchContext() {
            return property; // only allow the same property for all messages in the batch message
        }

        public Object nextBatchContext(Operation operation, Object batchContext) {
            return property; // return the current property, it should equal the next message's property
        }

        public IEncodable[] getResponse(StateContext stateContext) {
            return FeatureModelUtils.toMessage((StateContext.FeatureModel) stateContext);
        }
    }
}
