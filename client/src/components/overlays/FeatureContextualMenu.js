import React from 'react';
import {DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {ContextualMenu, ContextualMenuItemType} from 'office-ui-fabric-react/lib/ContextualMenu';
import contextualMenuItems from '../contextualMenuItems';
import {getSetting} from '../../store/settings';

export const selectMultipleFeaturesContextualMenuItems = (selectedFeatureNames, onSelectAllFeatures, onDeselectAllFeatures, featureModel) => [
    contextualMenuItems.featureDiagram.features.selectAll(onSelectAllFeatures),
    contextualMenuItems.featureDiagram.features.deselectAll(onDeselectAllFeatures),
    {key: 'divider1', itemType: ContextualMenuItemType.Divider},
    contextualMenuItems.featureDiagram.features.newFeatureAbove(selectedFeatureNames, onDeselectAllFeatures, featureModel)
];

export default class extends React.Component {
    componentDidMount() {
        this.interval = window.setInterval(
            this.forceUpdate.bind(this),
            getSetting(this.props.settings, 'featureDiagram.overlay.throttleUpdate'));
    }

    componentWillUnmount() {
        window.clearInterval(this.interval);
    }

    render() {
        const {
                onDismiss, onSelectAllFeatures, onDeselectAllFeatures,
                isSelectMultipleFeatures, selectedFeatureNames, featureModel, featureName
            } = this.props,
            {gapSpace} = getSetting(this.props.settings, 'featureDiagram.overlay');
        const feature = featureModel && featureModel.getFeatureOrDismiss(featureName, this.props.isOpen, onDismiss);
        if (!feature)
            return null;
        return (
            <ContextualMenu
                target={featureModel.getElement(featureName)}
                onDismiss={onDismiss}
                hidden={!this.props.isOpen}
                isBeakVisible={!isSelectMultipleFeatures}
                gapSpace={isSelectMultipleFeatures ? 2 * gapSpace : gapSpace}
                directionalHint={
                    this.props.featureDiagramLayout === 'verticalTree'
                        ? DirectionalHint.bottomCenter
                        : DirectionalHint.rightCenter}
                items={isSelectMultipleFeatures
                    ? selectMultipleFeaturesContextualMenuItems(
                        selectedFeatureNames, onSelectAllFeatures, onDeselectAllFeatures, featureModel)
                    : [
                        contextualMenuItems.featureDiagram.feature.new(feature.name, onDismiss),
                        contextualMenuItems.featureDiagram.feature.remove(feature.name, onDismiss),
                        {key: 'divider1', itemType: ContextualMenuItemType.Divider},
                        contextualMenuItems.featureDiagram.feature.rename(feature.name, this.props.onShowOverlay),
                        contextualMenuItems.featureDiagram.feature.setDescription(feature.name, this.props.onShowOverlay),
                        {key: 'divider2', itemType: ContextualMenuItemType.Divider},
                        contextualMenuItems.featureDiagram.feature.details(feature.name, this.props.onShowOverlay)
                    ]
                }/>
        );
    }
}