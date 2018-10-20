package de.ovgu.spldev.varied;

import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.util.FeatureModelUtils;
import de.ovgu.spldev.varied.util.StringUtils;

import java.util.Objects;
import java.util.regex.Pattern;

public abstract class Artifact {
    private String name;
    private Project project;

    Artifact(Project project, String name) {
        Objects.requireNonNull(project, "no project given");
        if (!StringUtils.isPresent(name))
            throw new RuntimeException("no name given for artifact");
        if (name.contains(Path.SEPARATOR))
            throw new RuntimeException(Path.SEPARATOR + " not allowed in artifact name");
        this.name = name;
        this.project = project;
    }

    public String getName() {
        return name;
    }

    public Path getPath() {
        return new Path(project.getName(), name);
    }

    abstract public CollaborationSession getCollaborationSession();

    public static class Path {
        static String SEPARATOR = "::";
        String projectName;
        String artifactName;

        public Path(String artifactPath) {
            String parts[] = artifactPath.split(Pattern.quote(SEPARATOR));
            if (parts.length != 2)
                throw new RuntimeException("invalid artifact path given");
            this.projectName = parts[0];
            this.artifactName = parts[1];
        }

        Path(String projectName, String artifactName) {
            this.projectName = projectName;
            this.artifactName = artifactName;
        }

        String getProjectName() {
            return projectName;
        }

        String getArtifactName() {
            return artifactName;
        }

        public String toString() {
            return projectName + SEPARATOR + artifactName;
        }
    }

    public static class FeatureModel extends Artifact {
        private IFeatureModel featureModel;
        private CollaborationSession collaborationSession;

        FeatureModel(Project project, String name, String source) {
            this(project, name, source, name + ".xml");
        }

        FeatureModel(Project project, String name, String source, String fileName) {
            this(project, name, FeatureModelUtils.loadFeatureModel(source, fileName));
        }

        FeatureModel(Project project, String name, java.nio.file.Path path) {
            this(project, name, FeatureModelUtils.loadFeatureModel(path));
        }

        FeatureModel(Project project, String name, IFeatureModel featureModel) {
            super(project, name);
            this.featureModel = featureModel;
        }

        public CollaborationSession getCollaborationSession() {
            if (this.collaborationSession == null)
                this.collaborationSession = new CollaborationSession(new StateContext.FeatureModel(getPath(), featureModel));
            return collaborationSession;
        }
    }
}
