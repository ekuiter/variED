import React from 'react';
import {DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {ContextualMenu, ContextualMenuItemType} from 'office-ui-fabric-react/lib/ContextualMenu';
import contextualMenuItems from '../../contextualMenuItems';
import {getSetting} from '../../../store/settings';

export const selectMultipleFeaturesContextualMenuItems = (selectedFeatures, onDeselectAllFeatures) => [
    contextualMenuItems.featureDiagram.features.deselectAll(onDeselectAllFeatures),
    {key: 'divider1', itemType: ContextualMenuItemType.Divider},
    contextualMenuItems.featureDiagram.feature.newFeatureAbove(selectedFeatures, onDeselectAllFeatures)
];

export default props => {
    const {onDismiss, onDeselectAllFeatures, isSelectMultipleFeatures, selectedFeatures} = props,
        {gapSpace} = getSetting(props.settings, 'featureDiagram.treeLayout.overlay'),
        feature = props.node && props.node.feature();
    if (!feature)
        return null;
    return (
        <ContextualMenu
            target={props.nodeRef}
            onDismiss={onDismiss}
            hidden={!props.node}
            isBeakVisible={!isSelectMultipleFeatures}
            gapSpace={isSelectMultipleFeatures ? 2 * gapSpace : gapSpace}
            directionalHint={
                props.direction === 'vertical'
                    ? DirectionalHint.bottomCenter
                    : DirectionalHint.rightCenter}
            items={isSelectMultipleFeatures
                ? selectMultipleFeaturesContextualMenuItems(selectedFeatures, onDeselectAllFeatures)
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