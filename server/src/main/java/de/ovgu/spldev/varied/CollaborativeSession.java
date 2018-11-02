package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.common.operations.Operation;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Predicate;

/**
 * A collaborative session consists of a set of users that view and edit a artifact together.
 */
public class CollaborativeSession {
    private StateContext stateContext;
    private Set<User> users = new HashSet<>();

    CollaborativeSession(StateContext stateContext) {
        this.stateContext = Objects.requireNonNull(stateContext, "no state context given");
    }

    public void join(User newUser) {
        if (!users.add(newUser))
            throw new RuntimeException("user already joined");
        stateContext.sendInitialState(newUser);
        unicast(newUser, artifactPath -> new Api.Join(stateContext.getArtifactPath(), artifactPath), user -> user != newUser);
        broadcast(new Api.Join(stateContext.getArtifactPath(), newUser), user -> user != newUser);
    }

    public void leave(User oldUser) {
        if (users.remove(oldUser))
            broadcast(new Api.Leave(stateContext.getArtifactPath(), oldUser));
    }

    private void unicast(User targetUser, Function<User, Message.IEncodable> messageFunction, Predicate<User> predicate) {
        users.stream()
                .filter(predicate)
                .forEach(user -> targetUser.send(messageFunction.apply(user)));
    }

    private void broadcast(Message.IEncodable message, Predicate<User> predicate) {
        Objects.requireNonNull(message, "no message given");
        users.stream()
                .filter(predicate)
                .forEach(user -> user.send(message));
    }

    private void broadcast(Message.IEncodable message) {
        Objects.requireNonNull(message, "no message given");
        broadcast(message, user -> true);
    }

    private void broadcast(Message.IEncodable[] messages) {
        Objects.requireNonNull(messages, "no messages given");
        for (Message.IEncodable message : messages)
            broadcast(message);
    }

    public void onMessage(Message message) {
        Message.IDecodable decodableMessage = (Message.IDecodable) message;
        if (!decodableMessage.isValid(stateContext))
            throw new RuntimeException("invalid message " + message);
        Message.IEncodable[] response = null;
        if (message instanceof Message.IApplicable) {
            Message.IApplicable applicableMessage = (Message.IApplicable) message;
            response = applicableMessage.apply(stateContext);
        } else if (message instanceof Message.IUndoable) {
            Message.IUndoable undoableMessage = (Message.IUndoable) message;
            Operation operation = undoableMessage.getOperation(stateContext);
            if (operation != null) {
                stateContext.getOperationStack().apply(operation);
                response = undoableMessage.getResponse(stateContext);
            }
        } else
            throw new RuntimeException("message can not be processed");
        if (response != null)
            broadcast(response);
    }
}
