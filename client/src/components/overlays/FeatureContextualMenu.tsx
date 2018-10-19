/**
 * A Fabric contextual menu for a given feature.
 */

import React from 'react';
import {DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {ContextualMenu} from 'office-ui-fabric-react/lib/ContextualMenu';
import commands, {makeDivider} from '../commands';
import {FeatureDiagramLayoutType, Feature} from '../../types';
import FeatureComponent, {FeatureComponentProps} from './FeatureComponent';
import {OnShowOverlayFunction, OnCollapseFeaturesFunction, OnCollapseFeaturesBelowFunction, OnExpandFeaturesFunction, OnExpandFeaturesBelowFunction, OnDeselectAllFeaturesFunction} from '../../store/types';

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
    onDeselectAllFeatures: OnDeselectAllFeaturesFunction
};

export default class extends FeatureComponent({doUpdate: true})<Props> {
    renderIfFeature(feature: Feature) {
        const {
                onDismiss, onDeselectAllFeatures, isSelectMultipleFeatures, selectedFeatureNames, featureModel
            } = this.props,
            {gapSpace} = this.props.settings.featureDiagram.overlay;
        return (
            <ContextualMenu
                target={featureModel!.getElement(feature.name)!.querySelector('.rectAndText')}
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
                        this.props.onExpandFeaturesBelow, featureModel!)
                    : [
                        commands.featureDiagram.feature.newMenu(feature.name, onDismiss),
                        commands.featureDiagram.feature.removeMenu([feature], onDismiss),
                        commands.featureDiagram.feature.collapseMenu(
                            [feature], this.props.onCollapseFeatures, this.props.onExpandFeatures,
                            this.props.onCollapseFeaturesBelow, this.props.onExpandFeaturesBelow, onDismiss),
                        makeDivider(),
                        commands.featureDiagram.feature.rename(feature.name, this.props.onShowOverlay),
                        commands.featureDiagram.feature.setDescription(feature.name, this.props.onShowOverlay),
                        commands.featureDiagram.feature.properties([feature], onDismiss),
                        makeDivider(),
                        commands.featureDiagram.feature.details(feature.name, this.props.onShowOverlay)
                    ]
                }/>
        );
    }
}
