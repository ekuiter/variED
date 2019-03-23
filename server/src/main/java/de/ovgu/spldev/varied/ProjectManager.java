package de.ovgu.spldev.varied;

import com.google.common.io.Resources;
import de.ovgu.spldev.varied.util.FeatureModelUtils;
import de.ovgu.spldev.varied.util.StringUtils;
import org.pmw.tinylog.Logger;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Collection;
import java.util.HashSet;
import java.util.Scanner;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;

public class ProjectManager {
    private static ProjectManager instance;
    private ConcurrentHashMap<String, Project> projects = new ConcurrentHashMap<>();

    private Project variEDExamples = new Project("variED Examples");
    private Project featureIDEExamples = new Project("FeatureIDE Examples");

    {
        for (String example : new String[]{
                "Empty", "uvr2web", "CollaborativeModeling"
        })
            addExampleArtifact(variEDExamples, example);
        addProject(variEDExamples);
    }

    {
        // adds the FeatureIDE examples as of June 2018
        for (String example : new String[]{
                "aaed2000", "adderII", "adder", "aeb", "aim711", "aki3068net", "am31_sim", "APL-Model", "APL",
                "asb2305", "asb", "assabet", "at91sam7sek", "at91sam7xek", "atlas_mips32_4kc", "atlas_mips64_5kc",
                "Automotive01", "Automotive02_V1", "Automotive02_V2", "Automotive02_V3", "Automotive02_V4",
                "axTLS", "BerkeleyDB", "brutus", "Busybox_1.18.0", "calm16_ceb", "calm32_ceb", "Car",
                "ceb_v850", "cerfpda", "cerf", "ChatClient", "cma230", "cma28x", "cme555", "cq7708", "cq7750",
                "csb281", "dreamcast", "e7t", "ea2468", "eb40a", "eb40", "eb42", "eb55", "ebsa285", "ec555",
                "edb7xxx", "edosk2674", "EMBToolkit", "E-Shop", "excalibur_arm9", "fads", "FameDB2", "FameDB",
                "FeatureIDE", "FinancialServices01", "flexanet", "frv400", "GPLmedium", "GPLsmall", "GPLtiny",
                "gps4020", "grg", "h8300h_sim", "h8max", "h8s_sim", "hs7729pci", "innovator", "integrator_arm7",
                "integrator_arm9", "ipaq", "iq80310", "iq80321", "ixdp425", "jmr3904", "jtst", "Linux_2.6.33.3",
                "linux", "lpcmt", "m5272c3", "mac7100evb", "mace1", "malta_mips32_4kc", "malta_mips64_5kc",
                "mb93091", "mb93093", "mbx", "mcb2100", "moab", "mpc50", "nano", "npwr", "ocelot", "olpce2294",
                "olpch2294", "olpcl2294", "p2106", "pati", "pc_i82544", "pc_i82559", "pc_rltk8139", "pc_usb_d12",
                "pc_vmWare", "phycore229x", "phycore", "picasso", "pid", "PPU", "prpmc1100", "psim", "rattler",
                "ref4955", "refidt334", "sa1100mm", "SafeBali", "sam7ex256", "se7751", "se77x9", "sh4_202_md",
                "sh7708", "skmb91302", "sleb", "smdk2410", "snds", "SortingLine", "sparc_erc32", "sparc_leon",
                "sparclite_sim", "stb", "stdeval1", "stm3210e_eval", "TightVNC", "ts1000", "ts6", "tx39_sim",
                "uClibc-Base", "uClibc-Distribution", "uClibc", "uE250", "vads", "Violet", "viper", "vrc4373",
                "vrc4375", "WaterlooGenerated", "XSEngine"
        })
            addRemoteArtifact(featureIDEExamples, example,
                    "https://raw.githubusercontent.com/FeatureIDE/FeatureIDE/56bb944775e2a3087a1bd8f93334aa4f7a6712dc" +
                            "/plugins/de.ovgu.featureide.examples/featureide_examples/FeatureModels/" + example + "/model.xml");
        addProject(featureIDEExamples);
    }

    private ProjectManager() {
    }

    public static ProjectManager getInstance() {
        return instance == null ? instance = new ProjectManager() : instance;
    }

    Project getProject(String name) {
        return projects.get(name);
    }

    void addProject(Project project) {
        Logger.info("adding project {}", project);
        String name = project.getName();
        if (!StringUtils.isPresent(name))
            throw new RuntimeException("no name given for project");
        if (projects.containsValue(project))
            throw new RuntimeException("project already registered");
        if (projects.containsKey(name))
            throw new RuntimeException("another project already has that name, choose another name");
        projects.put(name, project);
    }

    void addRemoteArtifact(Project project, String artifactName, String url) {
        // use this with caution, as attackers may use it maliciously!
        project.addArtifact(new Artifact.FeatureModel(project, artifactName,
                () -> {
                    try {
                        Logger.info("loading remote artifact from " + url);
                        String source = new Scanner(new URL(url).openStream(), "UTF-8").useDelimiter("\\A").next();
                        return FeatureModelUtils.loadFeatureModel(source, artifactName + ".xml");
                    } catch (IOException e) {
                        throw new RuntimeException("could not add remote artifact at URL " + url);
                    }
                }));
    }

    void addExampleArtifact(Project project, String artifactName) {
        try {
            project.addArtifact(new Artifact.FeatureModel(project, artifactName,
                    Resources.getResource("examples/" + artifactName + ".xml")));
        } catch (URISyntaxException e) {
            throw new RuntimeException("invalid resource path given");
        }
    }

    public void removeProject(Project project) {
        Logger.info("removing project {}", project);
        projects.remove(project.getName());
    }

    Project getProject(Artifact.Path artifactPath) {
        return getProject(artifactPath.getProjectName());
    }

    Artifact getArtifact(Artifact.Path artifactPath) {
        Project project = getProject(artifactPath);
        if (project == null)
            return null;
        return project.getArtifact(artifactPath.getArtifactName());
    }

    Collection<Project> getProjects() {
        return projects.values();
    }

    Collection<Artifact> getArtifacts() {
        Collection<Artifact> artifacts = new HashSet<>();
        for (Project project : getProjects())
            artifacts.addAll(project.getArtifacts());
        return artifacts;
    }
}
