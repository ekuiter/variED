/**
 * A Fabric contextual menu for a given feature.
 */

import React from 'react';
import {DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {ContextualMenu} from 'office-ui-fabric-react/lib/ContextualMenu';
import commands, {makeDivider} from '../commands';
import {FeatureDiagramLayoutType} from '../../types';
import FeatureComponent, {FeatureComponentProps} from './FeatureComponent';
import {OnShowOverlayFunction, OnCollapseFeaturesFunction, OnCollapseFeaturesBelowFunction, OnExpandFeaturesFunction, OnExpandFeaturesBelowFunction, OnDeselectAllFeaturesFunction, OnRemoveFeaturesFunction, OnAddFeatureAboveFunction, OnAddFeatureBelowFunction, OnRemoveFeaturesBelowFunction, OnSetFeatureAbstractFunction, OnSetFeatureHiddenFunction, OnSetFeatureMandatoryFunction, OnSetFeatureAndFunction, OnSetFeatureOrFunction, OnSetFeatureAlternativeFunction} from '../../store/types';
import {GraphicalFeature} from '../../modeling/types';

type Props = FeatureComponentProps & {
    onDismiss: () => void,
    isOpen: boolean,
    isSelectMultipleFeatures: boolean,
    featureDiagramLayout: FeatureDiagramLayoutType,
    selectedFeatureNames: string[],
    onShowOverlay: OnShowOverlayFunction,
    onCollapseFeatures: OnCollapseFeaturesFunction,
    onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction,
    onExpandFeatures: OnExpandFeaturesFunction,
    onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
    onDeselectAllFeatures: OnDeselectAllFeaturesFunction,
    onRemoveFeatures: OnRemoveFeaturesFunction,
    onRemoveFeaturesBelow: OnRemoveFeaturesBelowFunction,
    onAddFeatureBelow: OnAddFeatureBelowFunction,
    onAddFeatureAbove: OnAddFeatureAboveFunction,
    onSetFeatureAbstract: OnSetFeatureAbstractFunction,
    onSetFeatureHidden: OnSetFeatureHiddenFunction,
    onSetFeatureMandatory: OnSetFeatureMandatoryFunction,
    onSetFeatureAnd: OnSetFeatureAndFunction,
    onSetFeatureOr: OnSetFeatureOrFunction,
    onSetFeatureAlternative: OnSetFeatureAlternativeFunction
};

export default class extends FeatureComponent({doUpdate: true})<Props> {
    renderIfFeature(feature: GraphicalFeature) {
        const {
                onDismiss, onDeselectAllFeatures, isSelectMultipleFeatures, selectedFeatureNames, graphicalFeatureModel
            } = this.props,
            {gapSpace} = this.props.settings.featureDiagram.overlay;
        return (
            <ContextualMenu
                target={graphicalFeatureModel!.getElement(feature.name)!.querySelector('.rectAndText')}
                onDismiss={onDismiss}
                hidden={!this.props.isOpen}
                isBeakVisible={!isSelectMultipleFeatures}
                gapSpace={isSelectMultipleFeatures ? 2 * gapSpace : gapSpace}
                directionalHint={
                    this.props.featureDiagramLayout === FeatureDiagramLayoutType.verticalTree
                        ? DirectionalHint.bottomCenter
                        : DirectionalHint.rightCenter}
                items={isSelectMultipleFeatures
                    ? commands.featureDiagram.feature.selectionItems(selectedFeatureNames, onDeselectAllFeatures,
                        this.props.onCollapseFeatures, this.props.onExpandFeatures, this.props.onCollapseFeaturesBelow,
                        this.props.onExpandFeaturesBelow, this.props.onAddFeatureAbove, this.props.onRemoveFeatures,
                        this.props.onRemoveFeaturesBelow, this.props.onSetFeatureAbstract, this.props.onSetFeatureHidden,
                        this.props.onSetFeatureMandatory, this.props.onSetFeatureAnd, this.props.onSetFeatureOr,
                        this.props.onSetFeatureAlternative, graphicalFeatureModel!)
                    : [
                        commands.featureDiagram.feature.newMenu(feature.name, this.props.onAddFeatureBelow, this.props.onAddFeatureAbove, onDismiss),
                        commands.featureDiagram.feature.removeMenu([feature], this.props.onRemoveFeatures, this.props.onRemoveFeaturesBelow, onDismiss),
                        commands.featureDiagram.feature.collapseMenu(
                            [feature], this.props.onCollapseFeatures, this.props.onExpandFeatures,
                            this.props.onCollapseFeaturesBelow, this.props.onExpandFeaturesBelow, onDismiss),
                        makeDivider(),
                        commands.featureDiagram.feature.rename(feature.name, this.props.onShowOverlay),
                        commands.featureDiagram.feature.setDescription(feature.name, this.props.onShowOverlay),
                        commands.featureDiagram.feature.properties([feature], this.props.onSetFeatureAbstract,
                            this.props.onSetFeatureHidden, this.props.onSetFeatureMandatory, this.props.onSetFeatureAnd,
                            this.props.onSetFeatureOr, this.props.onSetFeatureAlternative, onDismiss),
                        makeDivider(),
                        commands.featureDiagram.feature.details(feature.name, this.props.onShowOverlay)
                    ]
                }/>
        );
    }
}
