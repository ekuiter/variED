package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.util.CollaboratorUtils;
import org.pmw.tinylog.Logger;

import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class CollaboratorManager {
    private static CollaboratorManager instance;
    private ConcurrentHashMap<UUID, Collaborator> collaborators = new ConcurrentHashMap<>();

    private CollaboratorManager() {
    }

    public static CollaboratorManager getInstance() {
        return instance == null ? instance = new CollaboratorManager() : instance;
    }

    public void resetInstance() {
        collaborators.clear();
    }

    public UUID register(WebSocket webSocket, UUID siteID) {
        Collaborator collaborator;
        if (siteID != null) {
            if (collaborators.containsKey(siteID)) {
                collaborator = collaborators.get(siteID);
                collaborator.setWebSocket(webSocket);
                collaborator.sendPending();
            } else
                throw new RuntimeException("site ID " + siteID + " not registered");
        } else {
            collaborator = new Collaborator(webSocket);
            collaborators.put(collaborator.getSiteID(), collaborator);
        }
        collaborator.sendInitialInformation();
        Logger.info("registered site {}", collaborator.getSiteID());
        return collaborator.getSiteID();
    }

    public void unregister(UUID siteID) {
        Objects.requireNonNull(siteID, "site ID not provided");
        if (collaborators.containsKey(siteID)) {
            collaborators.get(siteID).leaveAllCollaborativeSessions();
            Logger.info("unregistered site {}", siteID);
        }
    }

    public void broadcast(Message.IEncodable message) {
        CollaboratorUtils.broadcast(collaborators.values(), message);
    }

    void onMessage(UUID siteID, Message message) throws Message.InvalidMessageException {
        Collaborator collaborator = collaborators.get(siteID);
        if (collaborator != null)
            collaborator.onMessage(message);
    }
}