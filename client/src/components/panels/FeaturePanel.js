import React from 'react';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';
import i18n from '../../i18n';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';
import contextualMenuItems from '../contextualMenuItems';

const buttonStyles = {root: {backgroundColor: 'transparent'}},
    transparentItems = items => items;

export default class extends React.Component {
    static defaultProps = {
        isOpen: false, onDismissed: null, featureName: null, onShowDialog: null, featureModel: null
    };

    onRenderFooterContent = () => (
        <CommandBar
            items={transparentItems([
                contextualMenuItems.featureDiagram.feature.new(this.props.featureName, this.props.onDismissed),
                contextualMenuItems.featureDiagram.feature.remove(this.props.featureName, this.props.onDismissed)
            ])}
            overflowItems={[
                contextualMenuItems.featureDiagram.feature.rename(this.props.featureName, this.props.onShowDialog),
                contextualMenuItems.featureDiagram.feature.setDescription(this.props.featureName, this.props.onShowDialog)
            ]}
            overflowButtonProps={{styles: buttonStyles}}
            styles={{root: {margin: '0 -40px', padding: '0 35px'}}}/>
    );

    render() {
        const feature = this.props.featureModel && this.props.featureModel.getFeatureOrDismiss(
            this.props.featureName, this.props.isOpen, this.props.onDismissed);
        if (!feature)
            return null;
        return (
            <Panel
                isOpen={this.props.isOpen}
                type={PanelType.smallFixedFar}
                onDismissed={this.props.onDismissed}
                isLightDismiss={true}
                headerText={
                    <span>
                        {i18n.t('panels.featurePanel.title')}: <strong>{this.props.featureName}</strong>
                    </span>}
                onRenderFooterContent={this.onRenderFooterContent}>
                {feature &&
                <p>{feature.description || <em>{i18n.t('panels.featurePanel.noDescriptionSet')}</em>}</p>}
            </Panel>
        );
    }
};