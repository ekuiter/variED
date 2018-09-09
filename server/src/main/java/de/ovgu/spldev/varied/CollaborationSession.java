package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.messaging.Api;
import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.statechanges.StateChange;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Predicate;

/**
 * A collaboration session consists of a set of users that view and edit a feature model together.
 */
public class CollaborationSession {
    private static CollaborationSession instance;
    private StateContext stateContext;
    private Set<User> users = new HashSet<>();

    private CollaborationSession(StateContext stateContext) {
        this.stateContext = Objects.requireNonNull(stateContext, "no state context given");
    }

    public static CollaborationSession getInstance() {
        return instance == null ? instance = new CollaborationSession(StateContext.DEFAULT) : instance;
    }

    public void join(User newUser) {
        if (!users.add(newUser))
            throw new RuntimeException("user already joined");
        unicast(newUser, Api.UserJoined::new, user -> user != newUser);
        broadcast(new Api.UserJoined(newUser), user -> user != newUser);
        stateContext.sendInitialState(newUser);
    }

    public void leave(User oldUser) {
        if (users.remove(oldUser))
            broadcast(new Api.UserLeft(oldUser));
    }

    public void unicast(User targetUser, Function<User, Message.IEncodable> messageFunction, Predicate<User> predicate) {
        users.stream()
                .filter(predicate)
                .forEach(user -> targetUser.send(messageFunction.apply(user)));
    }

    public void broadcast(Message.IEncodable message, Predicate<User> predicate) {
        Objects.requireNonNull(message, "no message given");
        users.stream()
                .filter(predicate)
                .forEach(user -> user.send(message));
    }

    public void broadcast(Message.IEncodable message) {
        Objects.requireNonNull(message, "no message given");
        broadcast(message, user -> true);
    }

    public void broadcast(Message.IEncodable[] messages) {
        Objects.requireNonNull(messages, "no messages given");
        for (Message.IEncodable message : messages)
            broadcast(message);
    }

    public void onMessage(Message message) {
        Objects.requireNonNull(message, "no message given");
        Message.IDecodable decodableMessage = (Message.IDecodable) message;
        if (!decodableMessage.isValid(stateContext))
            throw new RuntimeException("invalid message " + message);
        Message.IEncodable[] stateChangeMessages = null;
        if (message instanceof Message.IApplicable) {
            Message.IApplicable applicableMessage = (Message.IApplicable) message;
            stateChangeMessages = applicableMessage.apply(stateContext);
        } else if (message instanceof Message.IUndoable) {
            Message.IUndoable undoableMessage = (Message.IUndoable) message;
            StateChange stateChange = undoableMessage.getStateChange(stateContext);
            if (stateChange != null)
                stateChangeMessages = stateContext.getStateChangeStack().apply(stateChange);
        } else
            throw new RuntimeException("message can not be processed");
        if (stateChangeMessages != null)
            broadcast(stateChangeMessages);
    }
}
