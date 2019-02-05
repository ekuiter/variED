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
import {OnShowOverlayFunction, OnCollapseFeaturesFunction, OnCollapseFeaturesBelowFunction, OnExpandFeaturesFunction, OnExpandFeaturesBelowFunction, OnRemoveFeaturesFunction, OnAddFeatureBelowFunction, OnAddFeatureAboveFunction, OnSetFeatureAbstractFunction, OnSetFeatureHiddenFunction, OnSetFeatureMandatoryFunction, OnSetFeatureAndFunction, OnSetFeatureOrFunction, OnSetFeatureAlternativeFunction, OnRemoveFeaturesBelowFunction} from '../../store/types';

type Props = FeatureComponentProps & {
    onDismissed: () => void,
    isOpen: boolean,
    onShowOverlay: OnShowOverlayFunction,
    onCollapseFeatures: OnCollapseFeaturesFunction,
    onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction,
    onExpandFeatures: OnExpandFeaturesFunction,
    onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
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

const buttonStyles = {root: {backgroundColor: 'transparent'}},
    transparentItems = (items: ICommandBarItemProps[]) => items;

export default class extends FeatureComponent()<Props> {
    onRenderFooterContent = () => (
        <CommandBar
            items={transparentItems([
                commands.featureDiagram.feature.newMenu(this.props.featureUUID!, this.props.onAddFeatureBelow, this.props.onAddFeatureAbove, this.props.onDismissed, true),
                commands.featureDiagram.feature.removeMenu([this.feature], this.props.onRemoveFeatures, this.props.onRemoveFeaturesBelow, this.props.onDismissed, true)
            ])}
            overflowItems={[
                commands.featureDiagram.feature.collapseMenu(
                    [this.feature], this.props.onCollapseFeatures, this.props.onExpandFeatures,
                    this.props.onCollapseFeaturesBelow, this.props.onExpandFeaturesBelow, this.props.onDismissed),
                commands.featureDiagram.feature.rename(this.props.featureUUID!, this.props.onShowOverlay),
                commands.featureDiagram.feature.setDescription(this.props.featureUUID!, this.props.onShowOverlay),
                commands.featureDiagram.feature.properties([this.feature], this.props.onSetFeatureAbstract,
                    this.props.onSetFeatureHidden, this.props.onSetFeatureMandatory, this.props.onSetFeatureAnd,
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