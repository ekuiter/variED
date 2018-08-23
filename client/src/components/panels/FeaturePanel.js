import React from 'react';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';
import i18n from '../../i18n';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';
import contextualMenuItems from '../contextualMenuItems';

const buttonStyles = {root: {backgroundColor: 'transparent'}},
    transparentItems = items => items;

export default class extends React.Component {
    onRenderFooterContent = () => (
        <CommandBar
            items={transparentItems([
                contextualMenuItems.featureDiagram.feature.new(this.props.featureName, this.props.onDismiss),
                contextualMenuItems.featureDiagram.feature.remove(this.props.featureName, this.props.onDismiss)
            ])}
            overflowButtonProps={{styles: buttonStyles}}
            styles={{root: {margin: '0 -40px', padding: '0 35px'}}}/>
    );

    render() {
        const feature = this.props.featureModel && this.props.featureName
            ? this.props.featureModel.getFeature(this.props.featureName)
            : null;
        return (
            <Panel
                isOpen={this.props.isOpen}
                type={PanelType.smallFixedFar}
                onDismiss={this.props.onDismiss}
                isLightDismiss={true}
                headerText={
                    <span>
                        {i18n.t('panels.featurePanel.feature')}: <b>{this.props.featureName}</b>
                    </span>}
                onRenderFooterContent={this.onRenderFooterContent}>
                {feature &&
                <p>{feature.description || <em>{i18n.t('panels.featurePanel.noDescriptionSet')}</em>}</p>}
            </Panel>
        );
    }
};