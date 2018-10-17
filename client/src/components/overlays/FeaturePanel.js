/**
 * A Fabric panel that shows details for a feature and available operations.
 */

import React from 'react';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';
import i18n from '../../i18n';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';
import commands from '../commands';
import PropTypes from 'prop-types';
import {FeatureModelType} from '../../server/FeatureModel';
import FeatureComponent from './FeatureComponent';

const buttonStyles = {root: {backgroundColor: 'transparent'}},
    transparentItems = items => items;

export default class extends FeatureComponent({onDismissProp: 'onDismissed'}) {
    static propTypes = {
        onDismissed: PropTypes.func.isRequired,
        featureModel: FeatureModelType.isRequired,
        featureName: PropTypes.string.isRequired,
        isOpen: PropTypes.bool.isRequired,
        onShowOverlay: PropTypes.func.isRequired,
        onCollapseFeatures: PropTypes.func.isRequired,
        onExpandFeatures: PropTypes.func.isRequired,
        onCollapseFeaturesBelow: PropTypes.func.isRequired,
        onExpandFeaturesBelow: PropTypes.func.isRequired
    };

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

    renderIfFeature(feature) {
        return (
            <Panel
                isOpen={this.props.isOpen}
                type={PanelType.smallFixedFar}
                onDismissed={this.props.onDismissed}
                isLightDismiss={true}
                headerText={
                    <span>
                        {i18n.t('overlays.featurePanel.title')}: <strong>{feature.name}</strong>
                    </span>}
                onRenderFooterContent={this.onRenderFooterContent}>
                <p>{feature.description || <em>{i18n.t('overlays.featurePanel.noDescriptionSet')}</em>}</p>
            </Panel>
        );
    }
}