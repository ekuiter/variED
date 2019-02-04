package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.util.StringUtils;
import org.pmw.tinylog.Logger;

import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;

public class Project {
    private String name;
    private ConcurrentHashMap<String, Artifact> artifacts = new ConcurrentHashMap<>();

    Project(String name) {
        if (!StringUtils.isPresent(name))
            throw new RuntimeException("no name given for project");
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public String toString() {
        return name;
    }

    Artifact getArtifact(String name) {
        return artifacts.get(name);
    }

    void addArtifact(Artifact artifact) {
        Logger.info("adding artifact {} to project {}", artifact, this);
        String name = artifact.getName();
        if (!StringUtils.isPresent(name))
            throw new RuntimeException("no name given for artifact");
        if (artifact.getProject() != this)
            throw new RuntimeException("artifact registered with another project");
        if (artifacts.containsValue(artifact))
            throw new RuntimeException("artifact already registered");
        if (artifacts.containsKey(name))
            throw new RuntimeException("another artifact already has that name, choose another name");
        artifacts.put(name, artifact);
    }

    public void removeArtifact(Artifact artifact) {
        Logger.info("removing artifact {} from project {}", artifact, this);
        artifacts.remove(artifact.getName());
    }

    public Collection<Artifact> getArtifacts() {
        return artifacts.values();
    }
}