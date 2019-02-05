/**
 * A Fabric contextual menu for a given feature.
 */

import React from 'react';
import {DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {ContextualMenu} from 'office-ui-fabric-react/lib/ContextualMenu';
import commands, {makeDivider} from '../commands';
import {FeatureDiagramLayoutType} from '../../types';
import FeatureComponent, {FeatureComponentProps, isFeatureOffscreen} from './FeatureComponent';
import {OnShowOverlayFunction, OnCollapseFeaturesFunction, OnCollapseFeaturesBelowFunction, OnExpandFeaturesFunction, OnExpandFeaturesBelowFunction, OnDeselectAllFeaturesFunction, OnRemoveFeaturesFunction, OnAddFeatureAboveFunction, OnAddFeatureBelowFunction, OnRemoveFeaturesBelowFunction, OnSetFeatureAbstractFunction, OnSetFeatureHiddenFunction, OnSetFeatureMandatoryFunction, OnSetFeatureAndFunction, OnSetFeatureOrFunction, OnSetFeatureAlternativeFunction} from '../../store/types';
import {Feature} from '../../modeling/types';

type Props = FeatureComponentProps & {
    onDismiss: () => void,
    isOpen: boolean,
    isSelectMultipleFeatures: boolean,
    featureDiagramLayout: FeatureDiagramLayoutType,
    selectedfeatureIDs: string[],
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
    renderIfFeature(feature: Feature) {
        const {
                onDismiss, onDeselectAllFeatures, isSelectMultipleFeatures, selectedfeatureIDs, featureModel
            } = this.props,
            {gapSpace} = this.props.settings.featureDiagram.overlay;
        if (!featureModel.hasElement(feature.ID))
            return null;
        const element = featureModel.getElement(feature.ID)!;
        return (
            <ContextualMenu
                target={element.querySelector('.rectAndText')}
                onDismiss={onDismiss}
                hidden={!this.props.isOpen || isFeatureOffscreen(element)}
                isBeakVisible={!isSelectMultipleFeatures}
                gapSpace={isSelectMultipleFeatures ? 2 * gapSpace : gapSpace}
                directionalHint={
                    this.props.featureDiagramLayout === FeatureDiagramLayoutType.verticalTree
                        ? DirectionalHint.bottomCenter
                        : DirectionalHint.rightCenter}
                items={isSelectMultipleFeatures
                    ? commands.featureDiagram.feature.selectionItems(selectedfeatureIDs, onDeselectAllFeatures,
                        this.props.onCollapseFeatures, this.props.onExpandFeatures, this.props.onCollapseFeaturesBelow,
                        this.props.onExpandFeaturesBelow, this.props.onAddFeatureAbove, this.props.onRemoveFeatures,
                        this.props.onRemoveFeaturesBelow, this.props.onSetFeatureAbstract, this.props.onSetFeatureHidden,
                        this.props.onSetFeatureMandatory, this.props.onSetFeatureAnd, this.props.onSetFeatureOr,
                        this.props.onSetFeatureAlternative, featureModel!)
                    : [
                        commands.featureDiagram.feature.newMenu(feature.ID, this.props.onAddFeatureBelow, this.props.onAddFeatureAbove, onDismiss),
                        commands.featureDiagram.feature.removeMenu([feature], this.props.onRemoveFeatures, this.props.onRemoveFeaturesBelow, onDismiss),
                        commands.featureDiagram.feature.collapseMenu(
                            [feature], this.props.onCollapseFeatures, this.props.onExpandFeatures,
                            this.props.onCollapseFeaturesBelow, this.props.onExpandFeaturesBelow, onDismiss),
                        makeDivider(),
                        commands.featureDiagram.feature.rename(feature.ID, this.props.onShowOverlay),
                        commands.featureDiagram.feature.setDescription(feature.ID, this.props.onShowOverlay),
                        commands.featureDiagram.feature.properties([feature], this.props.onSetFeatureAbstract,
                            this.props.onSetFeatureHidden, this.props.onSetFeatureMandatory, this.props.onSetFeatureAnd,
                            this.props.onSetFeatureOr, this.props.onSetFeatureAlternative, onDismiss),
                        makeDivider(),
                        commands.featureDiagram.feature.details(feature.ID, this.props.onShowOverlay)
                    ]
                }/>
        );
    }
}
