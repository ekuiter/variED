package de.ovgu.spldev.varied;

import com.google.gson.annotations.Expose;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.util.FeatureModelUtils;
import de.ovgu.spldev.varied.util.StringUtils;

import java.util.Objects;

public abstract class Artifact {
    private String name;
    private Project project;

    Artifact(Project project, String name) {
        Objects.requireNonNull(project, "no project given");
        if (!StringUtils.isPresent(name))
            throw new RuntimeException("no name given for artifact");
        this.name = name;
        this.project = project;
    }

    public String getName() {
        return name;
    }

    public Project getProject() {
        return project;
    }

    public Path getPath() {
        return new Path(project.getName(), name);
    }

    public String toString() {
        return getPath().toString();
    }

    abstract public CollaborativeSession getCollaborativeSession();

    public static class Path {
        static String SEPARATOR = "::";

        @Expose
        String project;

        @Expose
        String artifact;

        Path(String projectName, String artifactName) {
            this.project = projectName;
            this.artifact = artifactName;
        }

        String getProjectName() {
            if (project == null)
                throw new RuntimeException("no project given in artifact path");
            return project;
        }

        String getArtifactName() {
            if (artifact == null)
                throw new RuntimeException("no artifact given in artifact path");
            return artifact;
        }

        public String toString() {
            return getProjectName() + SEPARATOR + getArtifactName();
        }
    }

    public static class FeatureModel extends Artifact {
        private IFeatureModel initialFeatureModel;
        private CollaborativeSession collaborativeSession;

        FeatureModel(Project project, String name, String source) {
            this(project, name, source, name + ".xml");
        }

        FeatureModel(Project project, String name, String source, String fileName) {
            this(project, name, FeatureModelUtils.loadFeatureModel(source, fileName));
        }

        FeatureModel(Project project, String name, java.nio.file.Path path) {
            this(project, name, FeatureModelUtils.loadFeatureModel(path));
        }

        FeatureModel(Project project, String name, IFeatureModel initialFeatureModel) {
            super(project, name);
            this.initialFeatureModel = initialFeatureModel;
        }

        public CollaborativeSession getCollaborativeSession() {
            if (this.collaborativeSession == null)
                this.collaborativeSession = new CollaborativeSession.FeatureModel(getPath(), initialFeatureModel);
            return collaborativeSession;
        }
    }
}
