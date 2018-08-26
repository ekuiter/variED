import React from 'react';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';
import i18n from '../../i18n';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';
import contextualMenuItems from '../contextualMenuItems';
import PropTypes from 'prop-types';
import {FeatureModelType} from '../../server/FeatureModel';
import FeatureComponent from './FeatureComponent';

const buttonStyles = {root: {backgroundColor: 'transparent'}},
    transparentItems = items => items;

class FeaturePanel extends FeatureComponent({onDismissProp: 'onDismissed'}) {
    onRenderFooterContent = () => (
        <CommandBar
            items={transparentItems([
                contextualMenuItems.featureDiagram.feature.new(this.props.featureName, this.props.onDismissed),
                contextualMenuItems.featureDiagram.feature.remove(this.props.featureName, this.props.onDismissed)
            ])}
            overflowItems={[
                contextualMenuItems.featureDiagram.feature.rename(this.props.featureName, this.props.onShowOverlay),
                contextualMenuItems.featureDiagram.feature.setDescription(this.props.featureName, this.props.onShowOverlay),
                contextualMenuItems.featureDiagram.feature.properties(this.feature)
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
                        {i18n.t('panels.featurePanel.title')}: <strong>{feature.name}</strong>
                    </span>}
                onRenderFooterContent={this.onRenderFooterContent}>
                <p>{feature.description || <em>{i18n.t('panels.featurePanel.noDescriptionSet')}</em>}</p>
            </Panel>
        );
    }
}

FeaturePanel.propTypes = {
    onDismissed: PropTypes.func.isRequired,
    featureModel: FeatureModelType.isRequired,
    featureName: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onShowOverlay: PropTypes.func.isRequired
};

export default FeaturePanel;