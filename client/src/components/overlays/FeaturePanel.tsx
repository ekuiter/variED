/**
 * A Fabric panel that shows details for a feature and available operations.
 */

import React from 'react';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';
import i18n from '../../i18n';
import {CommandBar, ICommandBarItemProps} from 'office-ui-fabric-react/lib/CommandBar';
import commands from '../commands';
import FeatureComponent, {FeatureComponentProps} from './FeatureComponent';
import {Feature} from '../../types';

type Props = FeatureComponentProps & {
    onDismissed: () => void,
    isOpen: boolean,
    onShowOverlay: (...args: any[]) => void, // TODO
    onCollapseFeatures: (...args: any[]) => void,
    onCollapseFeaturesBelow: (...args: any[]) => void,
    onExpandFeatures: (...args: any[]) => void,
    onExpandFeaturesBelow: (...args: any[]) => void,
};

const buttonStyles = {root: {backgroundColor: 'transparent'}},
    transparentItems = (items: ICommandBarItemProps[]) => items;

export default class extends FeatureComponent()<Props> {
    onRenderFooterContent = () => (
        <CommandBar
            items={transparentItems([
                commands.featureDiagram.feature.newMenu(this.props.featureName, this.props.onDismissed, true),
                commands.featureDiagram.feature.removeMenu([this.feature], this.props.onDismissed, true)
            ])}
            overflowItems={[
                commands.featureDiagram.feature.collapseMenu(
                    [this.feature], this.props.onCollapseFeatures, this.props.onExpandFeatures,
                    this.props.onCollapseFeaturesBelow, this.props.onExpandFeaturesBelow, this.props.onDismissed),
                commands.featureDiagram.feature.rename(this.props.featureName, this.props.onShowOverlay),
                commands.featureDiagram.feature.setDescription(this.props.featureName, this.props.onShowOverlay),
                commands.featureDiagram.feature.properties([this.feature], this.props.onDismissed)
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