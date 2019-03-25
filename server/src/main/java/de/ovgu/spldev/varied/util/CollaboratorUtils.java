package de.ovgu.spldev.varied.util;

import de.ovgu.spldev.varied.Collaborator;
import de.ovgu.spldev.varied.messaging.Message;

import java.util.Collection;
import java.util.Objects;
import java.util.function.Predicate;

public class CollaboratorUtils {
    public static void broadcast(Collection<Collaborator> collaborators, Message.IEncodable message, Predicate<Collaborator> predicate) {
        Objects.requireNonNull(message, "no message given");
        collaborators.stream()
                .filter(predicate)
                .forEach(collaborator -> collaborator.send(message));
    }

    public static void broadcastToOthers(Collection<Collaborator> collaborators, Message.IEncodable message, Collaborator collaborator) {
        broadcast(collaborators, message, otherCollaborator -> otherCollaborator != collaborator);
    }
}
