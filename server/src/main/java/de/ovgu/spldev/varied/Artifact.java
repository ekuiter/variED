package de.ovgu.spldev.varied;

import com.google.gson.annotations.Expose;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.util.FeatureModelUtils;
import de.ovgu.spldev.varied.util.StringUtils;

import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.function.Supplier;

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
        static String SEPARATOR = "/";

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
        private Supplier<IFeatureModel> initialFeatureModelSupplier;
        private CollaborativeSession collaborativeSession;


        FeatureModel(Project project, String name, String source) {
            this(project, name, source, name + ".xml");
        }

        FeatureModel(Project project, String name, String source, String fileName) {
            this(project, name, () -> FeatureModelUtils.loadFeatureModel(source, fileName));
        }

        FeatureModel(Project project, String name, java.nio.file.Path path) {
            this(project, name, () -> FeatureModelUtils.loadFeatureModel(path));
        }

        FeatureModel(Project project, String name, URL url) throws URISyntaxException {
            this(project, name, Paths.get(url.toURI()));
        }

        FeatureModel(Project project, String name, IFeatureModel initialFeatureModel) {
            this(project, name, () -> initialFeatureModel);
        }

        FeatureModel(Project project, String name, Supplier<IFeatureModel> initialFeatureModelSupplier) {
            super(project, name);
            this.initialFeatureModelSupplier = initialFeatureModelSupplier;
        }

        public IFeatureModel getInitialFeatureModel() {
            return initialFeatureModelSupplier.get();
        }

        public CollaborativeSession getCollaborativeSession() {
            if (this.collaborativeSession == null)
                this.collaborativeSession = new CollaborativeSession.FeatureModel(getPath(), initialFeatureModelSupplier.get());
            return collaborativeSession;
        }
    }
}
