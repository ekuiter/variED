package de.ovgu.spldev.varied.common.operations.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.IFeatureStructure;
import de.ovgu.spldev.varied.common.operations.Operation;
import de.ovgu.spldev.varied.common.util.BridgeUtils;
import de.ovgu.spldev.varied.common.util.FeatureUtils;
import de.ovgu.spldev.varied.common.util.StringUtils;

import java.util.LinkedList;

public class FeatureSetProperty extends Operation {
    private IFeature feature;
    private String property, oldValue, value;
    private LinkedList<IFeatureStructure> oldMandatoryChildren;

    public FeatureSetProperty(IFeatureModel featureModel, String feature, String property, String value, Object batchContext) {
        if (batchContext != null && !BridgeUtils.equals(property, batchContext))
            throw new RuntimeException("can not set different properties in one batch message");

        this.feature = FeatureUtils.requireFeature(featureModel, feature);
        this.property = property;
        this.value = value;
        if (!StringUtils.isOneOf(property, new String[]{"abstract", "hidden", "mandatory", "group"}))
            throw new RuntimeException("invalid property given");
        if (property.equals("group")) {
            if (!StringUtils.isOneOf(value, new String[]{"and", "or", "alternative"}))
                throw new RuntimeException("invalid value given");
        } else if (!StringUtils.isOneOf(value, new String[]{"true", "false"}))
            throw new RuntimeException("invalid value given");
    }

    private void setMandatoryChildrenToOptional() {
        feature.getStructure().getChildren().forEach(child -> {
            if (child.isMandatory()) {
                oldMandatoryChildren.add(child);
                child.setMandatory(false);
            }
        });
    }

    private void setOldMandatoryChildrenToMandatory() {
        oldMandatoryChildren.forEach(child -> child.setMandatory(true));
    }

    public void apply() {
        oldMandatoryChildren = new LinkedList<>();
        switch (property) {
            case "abstract":
                oldValue = feature.getStructure().isAbstract() ? "true" : "false";
                feature.getStructure().setAbstract(value.equals("true"));
                break;
            case "hidden":
                oldValue = feature.getStructure().isHidden() ? "true" : "false";
                feature.getStructure().setHidden(value.equals("true"));
                break;
            case "mandatory":
                oldValue = feature.getStructure().isMandatory() ? "true" : "false";

                if (feature.getStructure().isRoot() && value.equals("false"))
                    throw new RuntimeException("can not set the root feature as optional");

                IFeatureStructure parent = feature.getStructure().getParent();
                if (parent != null && (parent.isOr() || parent.isAlternative()) && value.equals("true"))
                    throw new RuntimeException("can not set a child of a or/alternative group as mandatory");

                feature.getStructure().setMandatory(value.equals("true"));
                break;
            case "group":
                oldValue = feature.getStructure().isOr() ? "or" :
                        feature.getStructure().isAlternative() ? "alternative" : "and";

                if (value.equals("or")) {
                    setMandatoryChildrenToOptional();
                    feature.getStructure().changeToOr();
                }

                if (value.equals("alternative")) {
                    setMandatoryChildrenToOptional();
                    feature.getStructure().changeToAlternative();
                }

                if (value.equals("and"))
                    feature.getStructure().changeToAnd();
                break;
        }
    }

    public void undo() {
        switch (property) {
            case "abstract":
                feature.getStructure().setAbstract(oldValue.equals("true"));
                break;
            case "hidden":
                feature.getStructure().setHidden(oldValue.equals("true"));
                break;
            case "mandatory":
                feature.getStructure().setMandatory(oldValue.equals("true"));
                break;
            case "group":
                if (oldValue.equals("or"))
                    feature.getStructure().changeToOr();
                if (oldValue.equals("alternative"))
                    feature.getStructure().changeToAlternative();
                if (oldValue.equals("and")) {
                    feature.getStructure().changeToAnd();
                    setOldMandatoryChildrenToMandatory();
                }
                break;
        }
    }
}
