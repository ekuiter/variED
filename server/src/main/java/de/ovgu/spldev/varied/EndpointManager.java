package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.util.StringUtils;

import java.util.HashSet;
import java.util.Set;

/**
 * Holds the set of all endpoints and manages endpoint registration
 */
public class EndpointManager {
    private static EndpointManager instance;
    private Set<Endpoint> endpoints = new HashSet<>();

    private EndpointManager() {}

    public static EndpointManager getInstance() {
        return instance == null ? instance = new EndpointManager() : instance;
    }

    public boolean isLabelAvailable(String label) {
        for (Endpoint endpoint : endpoints)
            if (label.equals(endpoint.getLabel()))
                return false;
            return true;
    }

    public void register(Endpoint newEndpoint) {
        String label = newEndpoint.getLabel();
        if (!StringUtils.isPresent(label))
            throw new RuntimeException("no label supplied on registration");
        for (Endpoint endpoint : endpoints)
            if (label.equals(endpoint.getLabel()))
                throw new RuntimeException("label already registered, choose another label");
        if (!endpoints.add(newEndpoint))
            throw new RuntimeException("endpoint already registered");
    }

    public void unregister(Endpoint oldEndpoint) {
        endpoints.remove(oldEndpoint);
    }
}
