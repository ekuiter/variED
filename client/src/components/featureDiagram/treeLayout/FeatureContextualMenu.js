import React from 'react';
import {DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {ContextualMenu, ContextualMenuItemType} from 'office-ui-fabric-react/lib/ContextualMenu';
import contextualMenuItems from '../../contextualMenuItems';
import {getSetting} from '../../../store/settings';

export default props => {
    const onDismiss = props.onDismiss,
        {gapSpace} = getSetting(props.settings, 'featureDiagram.treeLayout.overlay'),
        feature = props.node && props.node.feature();
    if (!feature)
        return null;
    return (
        <ContextualMenu target={props.nodeRef}
                        onDismiss={onDismiss}
                        hidden={!props.node}
                        isBeakVisible={true}
                        gapSpace={gapSpace}
                        directionalHint={
                            props.direction === 'vertical'
                                ? DirectionalHint.bottomCenter
                                : DirectionalHint.rightCenter}
                        items={[
                            contextualMenuItems.featureDiagram.feature.new(feature.name, onDismiss),
                            contextualMenuItems.featureDiagram.feature.remove(feature.name, onDismiss),
                            {itemType: ContextualMenuItemType.Divider},
                            contextualMenuItems.featureDiagram.feature.rename(feature.name, props.onShowDialog),
                            {itemType: ContextualMenuItemType.Divider},
                            contextualMenuItems.featureDiagram.feature.details(feature.name, props.onShowPanel)
                        ]}/>
    );
}