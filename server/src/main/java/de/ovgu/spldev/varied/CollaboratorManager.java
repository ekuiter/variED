package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.messaging.Message;
import org.pmw.tinylog.Logger;

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

    public UUID register(WebSocket webSocket, UUID siteID) {
        Collaborator collaborator;
        if (siteID != null) {
            if (collaborators.containsKey(siteID)) {
                collaborator = collaborators.get(siteID);
                collaborator.setWebSocket(webSocket);
                collaborator.sendPending();
            } else
                throw new RuntimeException("site ID " + siteID + " not yet registered");
        } else {
            collaborator = new Collaborator(webSocket);
            collaborators.put(collaborator.getSiteID(), collaborator);
            collaborator.sendInitialInformation();
        }
        Logger.info("registered site {}", collaborator.getSiteID());
        return collaborator.getSiteID();
    }

    void onMessage(UUID siteID, Message message) throws Message.InvalidMessageException {
        Collaborator collaborator = collaborators.get(siteID);
        if (collaborator != null)
            collaborator.onMessage(message);
    }
}