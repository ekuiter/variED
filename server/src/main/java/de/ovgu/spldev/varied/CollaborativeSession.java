package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.common.operations.Operation;
import org.pmw.tinylog.Logger;

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

    public String toString() {
        return stateContext.toString();
    }

    public void join(User newUser) {
        Logger.info("{} joins collaborative session {}", newUser, this);
        if (!users.add(newUser))
            throw new RuntimeException("user already joined");
        stateContext.sendInitialState(newUser);
        unicast(newUser, artifactPath -> new Api.Join(stateContext.getArtifactPath(), artifactPath), user -> user != newUser);
        broadcast(new Api.Join(stateContext.getArtifactPath(), newUser), user -> user != newUser);
    }

    public void leave(User oldUser) {
        Logger.info("{} leaves collaborative session {}", oldUser, this);
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
        Logger.info("decoding message {}", message);
        Message.IDecodable decodableMessage = (Message.IDecodable) message;
        if (!decodableMessage.isValid(stateContext))
            throw new RuntimeException("invalid message " + message);
        Message.IEncodable[] response = null;
        if (message instanceof Message.IApplicable) {
            Logger.info("processing applicable message {}", message);
            Message.IApplicable applicableMessage = (Message.IApplicable) message;
            response = applicableMessage.apply(stateContext);
        } else if (message instanceof Message.IUndoable) {
            Logger.info("processing undoable message {}", message);
            Message.IUndoable undoableMessage = (Message.IUndoable) message;
            Operation operation = undoableMessage.getOperation(stateContext);
            if (operation != null) {
                Logger.info("applying operation {}", operation);
                stateContext.getOperationStack().apply(operation);
                response = undoableMessage.getResponse(stateContext);
            }
        } else
            throw new RuntimeException("message can not be processed");
        if (response != null) {
            Logger.info("broadcasting {} response message(s)", response.length);
            broadcast(response);
        }
    }
}
