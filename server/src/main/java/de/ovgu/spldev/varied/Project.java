package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.util.StringUtils;

import java.util.HashMap;

public class Project {
    private String name;
    private HashMap<String, Artifact> artifacts = new HashMap<>();

    Project(String name) {
        if (!StringUtils.isPresent(name))
            throw new RuntimeException("no name given for project");
        if (name.contains(Artifact.Path.SEPARATOR))
            throw new RuntimeException(Artifact.Path.SEPARATOR + " not allowed in project name");
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
}