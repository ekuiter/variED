import React from 'react';
import {DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {ContextualMenu, ContextualMenuItemType} from 'office-ui-fabric-react/lib/ContextualMenu';
import contextualMenuItems from '../../contextualMenuItems';
import {getSetting} from '../../../store/settings';

export const selectMultipleFeaturesContextualMenuItems = (selectedFeatureNames, onSelectAllFeatures, onDeselectAllFeatures, featureModel) => [
    contextualMenuItems.featureDiagram.features.selectAll(onSelectAllFeatures),
    contextualMenuItems.featureDiagram.features.deselectAll(onDeselectAllFeatures),
    {key: 'divider1', itemType: ContextualMenuItemType.Divider},
    contextualMenuItems.featureDiagram.features.newFeatureAbove(selectedFeatureNames, onDeselectAllFeatures, featureModel)
];

export default props => {
    const {
            onDismiss, onSelectAllFeatures, onDeselectAllFeatures,
            isSelectMultipleFeatures, selectedFeatureNames, featureModel, featureName
        } = props,
        {gapSpace} = getSetting(props.settings, 'featureDiagram.treeLayout.overlay');
    const feature = featureModel && featureModel.getFeatureOrDismiss(featureName, featureName, onDismiss);
    if (!feature)
        return null;
    return (
        <ContextualMenu
            target={props.nodeRef}
            onDismiss={onDismiss}
            hidden={!props.featureName}
            isBeakVisible={!isSelectMultipleFeatures}
            gapSpace={isSelectMultipleFeatures ? 2 * gapSpace : gapSpace}
            directionalHint={
                props.direction === 'vertical'
                    ? DirectionalHint.bottomCenter
                    : DirectionalHint.rightCenter}
            items={isSelectMultipleFeatures
                ? selectMultipleFeaturesContextualMenuItems(
                    selectedFeatureNames, onSelectAllFeatures, onDeselectAllFeatures, featureModel)
                : [
                    contextualMenuItems.featureDiagram.feature.new(feature.name, onDismiss),
                    contextualMenuItems.featureDiagram.feature.remove(feature.name, onDismiss),
                    {key: 'divider1', itemType: ContextualMenuItemType.Divider},
                    contextualMenuItems.featureDiagram.feature.rename(feature.name, props.onShowDialog),
                    {key: 'divider2', itemType: ContextualMenuItemType.Divider},
                    contextualMenuItems.featureDiagram.feature.details(feature.name, props.onShowPanel)
                ]
            }/>
    );
}