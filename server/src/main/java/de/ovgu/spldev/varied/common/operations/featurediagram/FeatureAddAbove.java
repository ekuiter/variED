package de.ovgu.spldev.varied.common.operations.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.featureide.fm.core.base.IFeatureStructure;
import de.ovgu.spldev.varied.common.operations.Operation;
import de.ovgu.spldev.varied.common.util.BridgeUtils;
import de.ovgu.spldev.varied.common.util.FeatureUtils;

import java.util.Collections;
import java.util.LinkedList;
import java.util.TreeMap;

// adapted from CreateFeatureAboveOperation
public class FeatureAddAbove extends Operation {
    private IFeatureModel featureModel;
    private IFeature newCompound;
    private IFeature child;
    private LinkedList<IFeature> selectedFeatures;
    private TreeMap<Integer, IFeature> children = new TreeMap<>();
    private boolean parentOr = false;
    private boolean parentAlternative = false;

    public FeatureAddAbove(IFeatureModel featureModel, String[] aboveFeatureUUIDs, String newFeatureUUID) throws InvalidOperationException {
        if (aboveFeatureUUIDs == null || aboveFeatureUUIDs.length == 0)
            throw new IllegalArgumentException("no features given");
        this.featureModel = featureModel;
        this.selectedFeatures = FeatureUtils.requireSiblingFeatures(featureModel, aboveFeatureUUIDs);
        FeatureUtils.sortSiblingFeatures(this.selectedFeatures);
        child = selectedFeatures.get(0);
        newCompound = BridgeUtils.createFeature(featureModel, BridgeUtils.requireValidFeatureUUID(featureModel, newFeatureUUID));
        FeatureUtils.setFeatureName(newCompound, newFeatureUUID); // TODO: choose a better default name
    }

    protected void _apply() {
        final IFeatureStructure parent = child.getStructure().getParent();
        if (parent != null) {
            parentOr = parent.isOr();
            parentAlternative = parent.isAlternative();

            newCompound.getStructure().setMultiple(parent.isMultiple());
            final int index = parent.getChildIndex(child.getStructure());
            for (final IFeature iFeature : selectedFeatures) {
                children.put(parent.getChildIndex(iFeature.getStructure()), iFeature);
            }
            for (final IFeature iFeature : selectedFeatures) {
                parent.removeChild(iFeature.getStructure());
            }
            parent.addChildAtPosition(index, newCompound.getStructure());
            for (final IFeature iFeature : selectedFeatures) {
                newCompound.getStructure().addChild(iFeature.getStructure());
            }

            if (parentOr) {
                newCompound.getStructure().changeToOr();
            } else if (parentAlternative) {
                newCompound.getStructure().changeToAlternative();
            } else {
                newCompound.getStructure().changeToAnd();
            }
            parent.changeToAnd();
            featureModel.addFeature(newCompound);
        } else {
            newCompound.getStructure().addChild(child.getStructure());
            featureModel.addFeature(newCompound);
            featureModel.getStructure().setRoot(newCompound.getStructure());
        }
    }

    protected void _undo() {
        final IFeatureStructure parent = newCompound.getStructure().getParent();
        if (parent != null) {
            newCompound.getStructure().setChildren(Collections.emptyList());
            featureModel.deleteFeature(newCompound);
            for (final Integer position : children.keySet()) {
                parent.addChildAtPosition(position, children.get(position).getStructure());
            }

            if (parentOr) {
                parent.changeToOr();
            } else if (parentAlternative) {
                parent.changeToAlternative();
            } else {
                parent.changeToAnd();
            }
        } else {
            featureModel.getStructure().replaceRoot(child.getStructure());
            newCompound.getStructure().removeChild(child.getStructure());
        }
    }
}
