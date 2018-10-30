package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.util.StringUtils;

import java.util.Collection;
import java.util.HashMap;
import java.util.Set;

public class Project {
    private String name;
    private HashMap<String, Artifact> artifacts = new HashMap<>();

    Project(String name) {
        if (!StringUtils.isPresent(name))
            throw new RuntimeException("no name given for project");
        this.name = name;
    }

    public String getName() {
        return name;
    }

    Artifact getArtifact(String name) {
        return artifacts.get(name);
    }

    void addArtifact(Artifact artifact) {
        String name = artifact.getName();
        if (!StringUtils.isPresent(name))
            throw new RuntimeException("no name given for artifact");
        if (artifacts.containsValue(artifact))
            throw new RuntimeException("artifact already registered");
        if (artifacts.containsKey(name))
            throw new RuntimeException("another artifact already has that name, choose another name");
        artifacts.put(name, artifact);
    }

    public void removeArtifact(Artifact artifact) {
        artifacts.remove(artifact.getName());
    }

    public Collection<Artifact> getArtifacts() {
        return artifacts.values();
    }
}