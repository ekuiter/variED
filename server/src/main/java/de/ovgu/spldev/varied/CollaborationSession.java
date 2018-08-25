package de.ovgu.spldev.varied;

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
        unicast(newEndpoint, Message.EndpointSubscribe::new, endpoint -> endpoint != newEndpoint);
        broadcast(new Message.EndpointSubscribe(newEndpoint), endpoint -> endpoint != newEndpoint);
        stateContext.sendInitialState(newEndpoint);
    }

    public void unsubscribe(Endpoint oldEndpoint) {
        if (endpoints.remove(oldEndpoint))
            broadcast(new Message.EndpointUnsubscribe(oldEndpoint));
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

    public void onMessage(Endpoint endpoint, Message message) {
        Objects.requireNonNull(message, "no message given");
        Message.IDecodable decodableMessage = (Message.IDecodable) message;
        if (!decodableMessage.isValid(stateContext))
            throw new RuntimeException("invalid message " + message);
        Message.IEncodable stateChangeMessage;
        if (message instanceof Message.IApplicable) {
            Message.IApplicable applicableMessage = (Message.IApplicable) message;
            stateChangeMessage = applicableMessage.apply(stateContext);
        } else if (message instanceof Message.IUndoable) {
            Message.IUndoable undoableMessage = (Message.IUndoable) message;
            StateChange stateChange = undoableMessage.getStateChange(stateContext);
            stateChangeMessage = stateContext.getStateChangeStack().apply(stateChange);
        } else
            throw new RuntimeException("message can not be processed");
        if (stateChangeMessage != null)
            broadcast(stateChangeMessage);
    }
}
