package de.ovgu.spldev.varied.messaging;

import com.google.gson.*;
import de.ovgu.featureide.fm.core.base.FeatureUtils;
import de.ovgu.featureide.fm.core.base.IConstraint;
import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.IPropertyContainer.Entry;
import de.ovgu.featureide.fm.core.base.IPropertyContainer.Type;
import de.ovgu.featureide.fm.core.io.xml.XmlPropertyLoader;
import org.prop4j.*;

import java.util.Collection;
import java.util.List;
import java.util.Set;

import static de.ovgu.featureide.fm.core.io.xml.XMLFeatureModelTags.*;
import static de.ovgu.featureide.fm.core.io.xml.XMLFeatureModelTags.AND;
import static de.ovgu.featureide.fm.core.io.xml.XMLFeatureModelTags.CALCULATE_FEATURES;
import static de.ovgu.featureide.fm.core.io.xml.XMLFeatureModelTags.CONSTRAINTS;
import static de.ovgu.featureide.fm.core.io.xml.XMLFeatureModelTags.DESCRIPTION;
import static de.ovgu.featureide.fm.core.io.xml.XMLFeatureModelTags.FEATURE;
import static de.ovgu.featureide.fm.core.io.xml.XMLFeatureModelTags.FEATURE_ORDER;
import static de.ovgu.featureide.fm.core.io.xml.XMLFeatureModelTags.OR;
import static de.ovgu.featureide.fm.core.io.xml.XMLFeatureModelTags.UNKNOWN;
import static de.ovgu.featureide.fm.core.localization.StringTable.*;

// adapted from XmlFeatureModelFormat
public class FeatureModelSerializer implements JsonSerializer<IFeatureModel> {
    public JsonElement serialize(IFeatureModel featureModel, java.lang.reflect.Type typeOfSrc, JsonSerializationContext context) {
        JsonObject root = new JsonObject(), calculations = new JsonObject(), order = new JsonObject();
        JsonArray struct = new JsonArray(), constraints = new JsonArray(), properties = new JsonArray(), comments = new JsonArray();

        root.add(STRUCT, struct);
        root.add(CONSTRAINTS, constraints);
        root.add(PROPERTIES, properties);
        root.add(CALCULATIONS, calculations);
        root.add(COMMENTS, comments);
        root.add(FEATURE_ORDER, order);

        createXmlDocRec(struct, FeatureUtils.getRoot(featureModel));

        for (final IConstraint constraint : featureModel.getConstraints()) {
            JsonObject rule = new JsonObject();
            rule.addProperty("type", RULE);
            constraints.add(rule);
            addDescription(constraint, rule);
            createPropositionalConstraints(rule, constraint.getNode());
        }

        createXmlPropertiesPart(properties, featureModel);

        calculations.addProperty(CALCULATE_AUTO, featureModel.getAnalyser().runCalculationAutomatically);
        calculations.addProperty(CALCULATE_FEATURES, featureModel.getAnalyser().calculateFeatures);
        calculations.addProperty(CALCULATE_CONSTRAINTS, featureModel.getAnalyser().calculateConstraints);
        calculations.addProperty(CALCULATE_REDUNDANT, featureModel.getAnalyser().calculateRedundantConstraints);
        calculations.addProperty(CALCULATE_TAUTOLOGY, featureModel.getAnalyser().calculateTautologyConstraints);

        for (final String comment : featureModel.getProperty().getComments()) {
            comments.add(comment);
        }

        order.addProperty(USER_DEFINED, featureModel.isFeatureOrderUserDefined());

        if (featureModel.isFeatureOrderUserDefined()) {
            Collection<String> featureOrderList = featureModel.getFeatureOrderList();

            if (featureOrderList.isEmpty()) {
                featureOrderList = FeatureUtils.extractConcreteFeaturesAsStringList(featureModel);
            }

            JsonArray children = new JsonArray();
            order.add("children", children);

            for (final String featureName : featureOrderList) {
                final JsonObject feature = new JsonObject();
                feature.addProperty("type", FEATURE);
                feature.addProperty(NAME, featureName);
                children.add(feature);
            }
        }

        return root;
    }

    private JsonObject createFeaturePropertyContainerNode(String featureName, Set<Entry<String, Type, Object>> propertyEntries) {
        final JsonObject result = new JsonObject();
        result.addProperty("type", FEATURE);
        result.addProperty(NAME, featureName);
        JsonArray children = new JsonArray();
        result.add("children", children);
        for (final Entry<String, Type, Object> entry : propertyEntries) {
            children.add(createPropertyEntriesNode(entry));
        }
        return result;
    }

    private JsonObject createPropertyEntriesNode(Entry<String, Type, Object> entry) {
        final JsonObject propertyElement = new JsonObject();
        propertyElement.addProperty("type", XmlPropertyLoader.PROPERTY);
        propertyElement.addProperty(XmlPropertyLoader.KEY, entry.getKey());
        propertyElement.addProperty(XmlPropertyLoader.VALUE, entry.getValue().toString());
        propertyElement.addProperty(XmlPropertyLoader.TYPE, entry.getType().toString());
        return propertyElement;
    }

    private void createPropositionalConstraints(JsonObject jsonNode, org.prop4j.Node node) {
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
    }

    private void createXmlDocRec(JsonArray node, IFeature feat) {
        if (feat == null) {
            return;
        }

        final List<IFeature> children = FeatureUtils.convertToFeatureList(feat.getStructure().getChildren());

        final JsonObject fnod;
        JsonArray fnodChildren = new JsonArray();
        if (children.isEmpty()) {
            fnod = new JsonObject();
            fnod.addProperty("type", FEATURE);
            writeAttributes(node, fnod, feat);
        } else {
            if (feat.getStructure().isAnd()) {
                fnod = new JsonObject();
                fnod.addProperty("type", AND);
            } else if (feat.getStructure().isOr()) {
                fnod = new JsonObject();
                fnod.addProperty("type", OR);
            } else if (feat.getStructure().isAlternative()) {
                fnod = new JsonObject();
                fnod.addProperty("type", ALT);
            } else {
                fnod = new JsonObject();
                fnod.addProperty("type", UNKNOWN);
            }
            fnod.add("children", fnodChildren);
            writeAttributes(node, fnod, feat);

            for (final IFeature feature : children) {
                createXmlDocRec(fnodChildren, feature);
            }

        }

    }

    protected void addDescription(IConstraint constraint, JsonObject fnod) {
        final String description = constraint.getDescription();
        if ((description != null) && !description.trim().isEmpty()) {
            fnod.addProperty(DESCRIPTION, description.replace("\r", ""));
        }
    }

    private void createXmlPropertiesPart(JsonArray propertiesNode, IFeatureModel featureModel) {

        if ((featureModel == null) || (propertiesNode == null)) {
            throw new RuntimeException();
        }

        // Store per-feature properties
        for (final IFeature feature : featureModel.getFeatures()) {
            final String featureName = feature.getName();
            final Set<Entry<String, Type, Object>> propertyEntries = feature.getCustomProperties().entrySet();
            if (!propertyEntries.isEmpty()) {
                propertiesNode.add(createFeaturePropertyContainerNode(featureName, propertyEntries));
            }
        }
    }

    private void writeAttributes(JsonArray node, JsonObject fnod, IFeature feat) {
        fnod.addProperty(NAME, feat.getName());
        if (feat.getStructure().isHidden()) {
            fnod.addProperty(HIDDEN, true);
        }
        if (feat.getStructure().isMandatory()) {
            if ((feat.getStructure().getParent() != null) && feat.getStructure().getParent().isAnd()) {
                fnod.addProperty(MANDATORY, true);
            } else if (feat.getStructure().getParent() == null) {
                fnod.addProperty(MANDATORY, true);
            }
        }
        if (feat.getStructure().isAbstract()) {
            fnod.addProperty(ABSTRACT, true);
        }

        final String description = feat.getProperty().getDescription();
        if ((description != null) && !description.trim().isEmpty()) {
            fnod.addProperty(DESCRIPTION, description.replace("\r", ""));
        }

        node.add(fnod);
    }
}
