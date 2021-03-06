/**
 * A Fabric panel that shows details for a feature and available operations.
 */

import React from 'react';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';
import i18n from '../../i18n';
import {CommandBar, ICommandBarItemProps} from 'office-ui-fabric-react/lib/CommandBar';
import commands from '../commands';
import FeatureComponent, {FeatureComponentProps} from './FeatureComponent';
import {Feature} from '../../modeling/types';
import {OnShowOverlayFunction, OnCollapseFeaturesFunction, OnCollapseFeaturesBelowFunction, OnExpandFeaturesFunction, OnExpandFeaturesBelowFunction, OnRemoveFeatureFunction, OnCreateFeatureBelowFunction, OnCreateFeatureAboveFunction, OnSetFeatureAbstractFunction, OnSetFeatureHiddenFunction, OnSetFeatureOptionalFunction, OnSetFeatureAndFunction, OnSetFeatureOrFunction, OnSetFeatureAlternativeFunction, OnRemoveFeatureSubtreeFunction} from '../../store/types';

type Props = FeatureComponentProps & {
    onDismissed: () => void,
    isOpen: boolean,
    onShowOverlay: OnShowOverlayFunction,
    onCollapseFeatures: OnCollapseFeaturesFunction,
    onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction,
    onExpandFeatures: OnExpandFeaturesFunction,
    onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
    onRemoveFeature: OnRemoveFeatureFunction,
    onRemoveFeatureSubtree: OnRemoveFeatureSubtreeFunction,
    onCreateFeatureBelow: OnCreateFeatureBelowFunction,
    onCreateFeatureAbove: OnCreateFeatureAboveFunction,
    onSetFeatureAbstract: OnSetFeatureAbstractFunction,
    onSetFeatureHidden: OnSetFeatureHiddenFunction,
    onSetFeatureOptional: OnSetFeatureOptionalFunction,
    onSetFeatureAnd: OnSetFeatureAndFunction,
    onSetFeatureOr: OnSetFeatureOrFunction,
    onSetFeatureAlternative: OnSetFeatureAlternativeFunction
};

const buttonStyles = {root: {backgroundColor: 'transparent'}},
    transparentItems = (items: ICommandBarItemProps[]) => items;

export default class extends FeatureComponent()<Props> {
    onRenderFooterContent = () => (
        <CommandBar
            items={transparentItems([
                commands.featureDiagram.feature.newMenu(this.props.featureID!, this.props.featureModel, this.props.onCreateFeatureBelow, this.props.onCreateFeatureAbove, this.props.onDismissed, true),
                commands.featureDiagram.feature.removeMenu([this.feature.ID], this.props.featureModel, this.props.onRemoveFeature, this.props.onRemoveFeatureSubtree, this.props.onDismissed, true)
            ])}
            overflowItems={[
                commands.featureDiagram.feature.collapseMenu(
                    [this.feature], this.props.onCollapseFeatures, this.props.onExpandFeatures,
                    this.props.onCollapseFeaturesBelow, this.props.onExpandFeaturesBelow, this.props.onDismissed),
                commands.featureDiagram.feature.rename(this.props.featureID!, this.props.featureModel, this.props.onShowOverlay),
                commands.featureDiagram.feature.setDescription(this.props.featureID!, this.props.featureModel, this.props.onShowOverlay),
                commands.featureDiagram.feature.properties([this.feature.ID], this.props.featureModel, this.props.onSetFeatureAbstract,
                    this.props.onSetFeatureHidden, this.props.onSetFeatureOptional, this.props.onSetFeatureAnd,
                    this.props.onSetFeatureOr, this.props.onSetFeatureAlternative, this.props.onDismissed)
            ]}
            overflowButtonProps={{styles: buttonStyles}}
            styles={{root: {margin: '0 -40px', padding: '0 35px'}}}/>
    );

    renderIfFeature(feature: Feature) {
        return (
            <Panel
                isOpen={this.props.isOpen}
                type={PanelType.smallFixedFar}
                onDismissed={this.props.onDismissed}
                isLightDismiss={true}
                headerText={
                    <span>
                        {i18n.t('overlays.featurePanel.title')}: <strong>{feature.name}</strong>
                    </span> as any}
                onRenderFooterContent={this.onRenderFooterContent}>
                <p>{feature.description || <em>{i18n.t('overlays.featurePanel.noDescriptionSet')}</em>}</p>
            </Panel>
        );
    }
}