package de.ovgu.spldev.varied.kernel;

import clojure.lang.PersistentHashMap;
import de.ovgu.featureide.fm.core.base.FeatureUtils;
import de.ovgu.featureide.fm.core.base.IConstraint;
import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import org.prop4j.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class FeatureModelFormat {
    public static PersistentHashMap toKernel(IFeatureModel featureModel) {
        HashMap<Object, Object> featureModelMap = new HashMap<>(),
                featuresMap = new HashMap<>(),
                constraintsMap = new HashMap<>();

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
            featuresMap.put(feature.getName(), Kernel.toPersistentHashMap(featureMap));
        });

        for (final IConstraint constraint : featureModel.getConstraints()) {
            HashMap<Object, Object> constraintMap = new HashMap<>();
            ArrayList<Object> formulaList = new ArrayList<>();
            createConstraint(formulaList, constraint.getNode());
            if (formulaList.size() != 1)
                throw new RuntimeException("constraint serialization failed");
            constraintMap.put(Kernel.keyword("formula"), formulaList.get(0));
            constraintMap.put(Kernel.keyword("graveyarded?"), false);
            constraintsMap.put(de.ovgu.spldev.varied.util.FeatureUtils.getConstraintID(constraint).toString(),
                    Kernel.toPersistentHashMap(constraintMap));
        }

        featureModelMap.put(Kernel.keyword("features"), Kernel.toPersistentHashMap(featuresMap));
        featureModelMap.put(Kernel.keyword("constraints"), Kernel.toPersistentHashMap(constraintsMap));
        return Kernel.toPersistentHashMap(featureModelMap);
    }

    private static void createConstraint(ArrayList<Object> formulaList, org.prop4j.Node node) {
        if (node == null)
            return;

        final ArrayList<Object> op = new ArrayList<>();
        if (node instanceof Literal) {
            final Literal literal = (Literal) node;
            if (literal.positive)
                formulaList.add(String.valueOf(literal.var));
            else {
                ArrayList<Object> opNot = new ArrayList<>();
                opNot.add(Kernel.keyword("not"));
                opNot.add(String.valueOf(literal.var));
                formulaList.add(Kernel.toPersistentVector(opNot));
            }
            return;
        } else if (node instanceof Or)
            op.add(Kernel.keyword("disj"));
        else if (node instanceof Equals)
            op.add(Kernel.keyword("eq"));
        else if (node instanceof Implies)
            op.add(Kernel.keyword("imp"));
        else if (node instanceof And)
            op.add(Kernel.keyword("conj"));
        else if (node instanceof Not)
            op.add(Kernel.keyword("not"));
        else
            throw new RuntimeException("unknown operator " + node.getClass() + " encountered");

        for (final org.prop4j.Node child : node.getChildren())
            createConstraint(op, child);

        formulaList.add(Kernel.toPersistentVector(op));
    }
}