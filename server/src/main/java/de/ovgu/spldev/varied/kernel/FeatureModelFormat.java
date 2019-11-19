package de.ovgu.spldev.varied.kernel;

import clojure.lang.*;
import de.ovgu.featureide.fm.core.base.*;
import de.ovgu.featureide.fm.core.base.impl.DefaultFeatureModelFactory;
import de.ovgu.featureide.fm.core.io.UnsupportedModelException;
import org.prop4j.*;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.NodeList;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;

import static de.ovgu.featureide.fm.core.io.xml.XMLFeatureModelTags.CONJ;
import static de.ovgu.featureide.fm.core.io.xml.XMLFeatureModelTags.DISJ;
import static de.ovgu.featureide.fm.core.localization.StringTable.NOT;

// adapted from de.ovgu.featureide.fm.core.io.xml.XmlFeatureModelFormat
public class FeatureModelFormat {
    public static APersistentMap toKernel(IFeatureModel featureModel) {
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
            featureMap.put(Kernel.keyword("optional?"), !feature.getStructure().isMandatory());
            featureMap.put(Kernel.keyword("name"), de.ovgu.spldev.varied.util.FeatureUtils.getFeatureName(feature));
            featureMap.put(Kernel.keyword("hidden?"), feature.getStructure().isHidden());
            featureMap.put(Kernel.keyword("abstract?"), feature.getStructure().isAbstract());
            final String description = feature.getProperty().getDescription();
            if ((description != null) && !description.trim().isEmpty()) {
                featureMap.put(Kernel.keyword("description"), description.replace("\r", ""));
            } else
                featureMap.put(Kernel.keyword("description"), null);
            featuresMap.put(feature.getName(), Kernel.toPersistentMap(featureMap));
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
                    Kernel.toPersistentMap(constraintMap));
        }

        featureModelMap.put(Kernel.keyword("features"), Kernel.toPersistentMap(featuresMap));
        featureModelMap.put(Kernel.keyword("constraints"), Kernel.toPersistentMap(constraintsMap));
        return Kernel.toPersistentMap(featureModelMap);
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

    public static IFeatureModel toFeatureModel(Object kernelContext) {
        IFeatureModelFactory featureModelFactory = DefaultFeatureModelFactory.getInstance();
        IFeatureModel featureModel = featureModelFactory.createFeatureModel();

        APersistentMap featuresHashMap, constraintsHashMap, childrenCacheHashMap;
        try {
            APersistentMap contextHashMap = (APersistentMap) kernelContext;
            Atom atom = (Atom) contextHashMap.get(Kernel.keyword("combined-effect"));
            APersistentMap featureModelHashMap = (APersistentMap) atom.deref();
            featuresHashMap = (APersistentMap) featureModelHashMap.get(Kernel.keyword("features"));
            constraintsHashMap = (APersistentMap) featureModelHashMap.get(Kernel.keyword("constraints"));
            childrenCacheHashMap = (APersistentMap) featureModelHashMap.get(Kernel.keyword("children-cache"));
        } catch (Throwable t) {
            throw new RuntimeException("feature model not available in kernel context");
        }

        parseFeatures(featureModelFactory, featureModel, featuresHashMap, childrenCacheHashMap,
                (APersistentSet) childrenCacheHashMap.get(null), null);

        for (final Object e : constraintsHashMap) {
            IMapEntry entry = (IMapEntry) e;
            String constraintID = (String) entry.key();
            APersistentMap constraintHashMap = (APersistentMap) entry.val();
            Object formula = constraintHashMap.get(Kernel.keyword("formula"));
            boolean graveyarded = (boolean) constraintHashMap.get(Kernel.keyword("graveyarded?"));

            if (!graveyarded)
                try {
                    featureModel.addConstraint(featureModelFactory.createConstraint(featureModel, parseConstraint(featureModel, formula)));
                } catch (GraveyardedFeatureException e1) {
                }
        }

        return featureModel;
    }

    private static void parseFeatures(IFeatureModelFactory featureModelFactory, IFeatureModel featureModel,
                                      APersistentMap featuresHashMap, APersistentMap childrenCacheHashMap, APersistentSet children, IFeature parent) {
        for (final Object child : children) {
            String featureID = (String) child;
            APersistentMap featureHashMap = (APersistentMap) featuresHashMap.get(featureID);
            if (featureModel.getFeature(featureID) != null)
                throw new RuntimeException("Duplicate entry for feature: " + featureID);

            final IFeature feature = featureModelFactory.createFeature(featureModel, featureID);
            String groupType = ((Keyword) featureHashMap.get(Kernel.keyword("group-type"))).getName();
            if (groupType.equals("and"))
                feature.getStructure().setAnd();
            else if (groupType.equals("alternative"))
                feature.getStructure().setAlternative();
            else if (groupType.equals("or"))
                feature.getStructure().setOr();
            feature.getStructure().setMandatory(!((boolean) featureHashMap.get(Kernel.keyword("optional?"))));
            feature.getStructure().setAbstract((boolean) featureHashMap.get(Kernel.keyword("abstract?")));
            feature.getStructure().setHidden((boolean) featureHashMap.get(Kernel.keyword("hidden?")));
            String description = (String) featureHashMap.get(Kernel.keyword("description"));
            if (description != null && !description.trim().isEmpty())
                feature.getProperty().setDescription(description.replace("\r", ""));
            de.ovgu.spldev.varied.util.FeatureUtils.setFeatureName(feature, (String) featureHashMap.get(Kernel.keyword("name")));

            featureModel.addFeature(feature);
            if (parent == null)
                featureModel.getStructure().setRoot(feature.getStructure());
            else
                parent.getStructure().addChild(feature.getStructure());

            if (childrenCacheHashMap.get(featureID) != null)
                parseFeatures(featureModelFactory, featureModel, featuresHashMap, childrenCacheHashMap,
                        (APersistentSet) childrenCacheHashMap.get(featureID), feature);
        }
    }

    private static Node parseConstraint(IFeatureModel featureModel, Object formula) throws GraveyardedFeatureException {
        if (formula instanceof String) {
            final String featureID = (String) formula;
            if (featureModel.getFeature(featureID) != null)
                return new Literal(featureID);
            else
                throw new GraveyardedFeatureException();
        } else if (formula instanceof APersistentVector) {
            APersistentVector formulaVector = (APersistentVector) formula;
            String op = ((Keyword) formulaVector.get(0)).getName();
            Node child1 = parseConstraint(featureModel, formulaVector.get(1));
            Node child2 = op.equals("not") ? null : parseConstraint(featureModel, formulaVector.get(2));
            if (op.equals("disj"))
                return new Or(child1, child2);
            else if (op.equals("conj"))
                return new And(child1, child2);
            else if (op.equals("eq"))
                return new Equals(child1, child2);
            else if (op.equals("imp"))
                return new Implies(child1, child2);
            else if (op.equals("not"))
                return new Not(child1);
        }
        return null;
    }

    private static class GraveyardedFeatureException extends Throwable {
    }
}