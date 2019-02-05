package de.ovgu.spldev.varied.kernel;

import clojure.lang.PersistentHashMap;
import de.ovgu.featureide.fm.core.base.FeatureUtils;
import de.ovgu.featureide.fm.core.base.IConstraint;
import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;

import java.util.HashMap;
import java.util.List;

public class FeatureModelFormat {
    static PersistentHashMap toKernel(IFeatureModel featureModel) {
        HashMap<Object, Object> featureModelMap = new HashMap<>(),
                featuresMap = new HashMap<>(),
                constraintsMap = new HashMap<>();
        featureModelMap.put(Kernel.keyword("features"), featuresMap);
        featureModelMap.put(Kernel.keyword("constraints"), constraintsMap);

        featureModel.getFeatures().forEach(feature -> {
            final List<IFeature> children = FeatureUtils.convertToFeatureList(feature.getStructure().getChildren());

            final HashMap<Object, Object> featureMap = new HashMap<>();
            if (children.isEmpty() || feature.getStructure().isAnd())
                featureMap.put(Kernel.keyword("group-type"), Kernel.keyword("and"));
            else if (feature.getStructure().isOr())
                featureMap.put(Kernel.keyword("group-type"), Kernel.keyword("or"));
            else if (feature.getStructure().isAlternative())
                featureMap.put(Kernel.keyword("group-type"), Kernel.keyword("alternative"));
            else
                throw new RuntimeException("unknown feature type");

            featureMap.put(Kernel.keyword("parent-ID"),
                    feature.getStructure().getParent() == null ? null : feature.getStructure().getParent().getFeature().getName());
            featureMap.put(Kernel.keyword("optional?"), feature.getStructure().isMandatory());
            featureMap.put(Kernel.keyword("name"), de.ovgu.spldev.varied.util.FeatureUtils.getFeatureName(feature));
            featureMap.put(Kernel.keyword("hidden"), feature.getStructure().isHidden());
            featureMap.put(Kernel.keyword("abstract"), feature.getStructure().isAbstract());
            final String description = feature.getProperty().getDescription();
            if ((description != null) && !description.trim().isEmpty()) {
                featureMap.put(Kernel.keyword("description"), description.replace("\r", ""));
            } else
                featureMap.put(Kernel.keyword("description"), null);
            featuresMap.put(feature.getName(), featureMap);
        });

        for (final IConstraint constraint : featureModel.getConstraints()) {
            HashMap<Object, Object> constraintMap = new HashMap<>();
            // TODO: proper format for constraints
            constraintMap.put(Kernel.keyword("formula"), constraint.toString());
            constraintMap.put(Kernel.keyword("graveyarded?"), false);
            constraintsMap.put(de.ovgu.spldev.varied.util.FeatureUtils.getConstraintID(constraint).toString(), constraintMap);
            //createPropositionalConstraints(rule, constraint.getNode());
        }

        return Kernel.toPersistentHashMap(featureModelMap);
    }

    /*private static void createPropositionalConstraints(JsonObject jsonNode, org.prop4j.Node node) {
        if (node == null) {
            return;
        }

        JsonArray children = new JsonArray();
        if (jsonNode.has("children"))
            children = jsonNode.getAsJsonArray("children");
        else
            jsonNode.add("children", children);

        final JsonObject op;
        if (node instanceof Literal) {
            final Literal literal = (Literal) node;
            if (!literal.positive) {
                JsonObject opNot = new JsonObject();
                opNot.addProperty("type", NOT);
                children.add(opNot);
                jsonNode = opNot;
                children = new JsonArray();
                jsonNode.add("children", children);
            }
            op = new JsonObject();
            op.addProperty("type", VAR);
            op.addProperty(VAR, String.valueOf(literal.var));
            children.add(op);
            return;
        } else if (node instanceof Or) {
            op = new JsonObject();
            op.addProperty("type", DISJ);
        } else if (node instanceof Equals) {
            op = new JsonObject();
            op.addProperty("type", EQ);
        } else if (node instanceof Implies) {
            op = new JsonObject();
            op.addProperty("type", IMP);
        } else if (node instanceof And) {
            op = new JsonObject();
            op.addProperty("type", CONJ);
        } else if (node instanceof Not) {
            op = new JsonObject();
            op.addProperty("type", NOT);
        } else if (node instanceof AtMost) {
            op = new JsonObject();
            op.addProperty("type", ATMOST1);
        } else {
            op = new JsonObject();
            op.addProperty("type", UNKNOWN);
        }
        children.add(op);

        for (final org.prop4j.Node child : node.getChildren()) {
            createPropositionalConstraints(op, child);
        }
    }*/
}
