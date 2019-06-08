package de.ovgu.spldev.varied.util;

import de.ovgu.spldev.varied.Collaborator;
import de.ovgu.spldev.varied.messaging.Message;

import java.util.Collection;
import java.util.Objects;
import java.util.function.Function;
import java.util.function.Predicate;

public class CollaboratorUtils {
    public static void broadcast(Collection<Collaborator> collaborators, Message.IEncodable message, Predicate<Collaborator> predicate) {
        Objects.requireNonNull(message, "no message given");
        collaborators.stream()
                .filter(predicate)
                .forEach(collaborator -> collaborator.send(message));
    }

    public static void broadcastToOtherCollaborators(Collection<Collaborator> collaborators, Message.IEncodable message, Collaborator collaborator) {
        broadcast(collaborators, message, otherCollaborator -> otherCollaborator != collaborator);
    }

    public static void sendForEveryCollaborator(Collaborator targetCollaborator, Collection<Collaborator> collaborators, Function<Collaborator, Message.IEncodable> messageFunction) {
        collaborators.stream()
                .filter(collaborator -> collaborator != targetCollaborator)
                .forEach(collaborator -> targetCollaborator.send(messageFunction.apply(collaborator)));
    }
}
