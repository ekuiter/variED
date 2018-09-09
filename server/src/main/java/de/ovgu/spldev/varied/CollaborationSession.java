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
 * A collaboration session consists of a set of endpoints that view and edit a feature model together.
 */
public class CollaborationSession {
    private static CollaborationSession instance;
    private StateContext stateContext;
    private Set<Endpoint> endpoints = new HashSet<>();

    private CollaborationSession(StateContext stateContext) {
        this.stateContext = Objects.requireNonNull(stateContext, "no state context given");
    }

    public static CollaborationSession getInstance() {
        return instance == null ? instance = new CollaborationSession(StateContext.DEFAULT) : instance;
    }

    public void subscribe(Endpoint newEndpoint) {
        if (!endpoints.add(newEndpoint))
            throw new RuntimeException("endpoint already subscribed");
        unicast(newEndpoint, Api.UserSubscribe::new, endpoint -> endpoint != newEndpoint);
        broadcast(new Api.UserSubscribe(newEndpoint), endpoint -> endpoint != newEndpoint);
        stateContext.sendInitialState(newEndpoint);
    }

    public void unsubscribe(Endpoint oldEndpoint) {
        if (endpoints.remove(oldEndpoint))
            broadcast(new Api.UserUnsubscribe(oldEndpoint));
    }

    public void unicast(Endpoint targetEndpoint, Function<Endpoint, Message.IEncodable> messageFunction, Predicate<Endpoint> predicate) {
        for (Endpoint endpoint : endpoints)
            if (predicate.test(endpoint))
                targetEndpoint.send(messageFunction.apply(endpoint));
    }

    public void broadcast(Message.IEncodable message, Predicate<Endpoint> predicate) {
        Objects.requireNonNull(message, "no message given");
        for (Endpoint endpoint : endpoints)
            if (predicate.test(endpoint))
                endpoint.send(message);
    }

    public void broadcast(Message.IEncodable message) {
        Objects.requireNonNull(message, "no message given");
        broadcast(message, endpoint -> true);
    }

    public void broadcast(Message.IEncodable[] messages) {
        Objects.requireNonNull(messages, "no messages given");
        for (Message.IEncodable message : messages)
            broadcast(message);
    }

    public void onMessage(Endpoint endpoint, Message message) {
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
