import React from 'react';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';

export default props => {
    const feature = props.featureModel && props.featureName ? props.featureModel.getFeature(props.featureName) : null;
    return (
        <Panel
            isOpen={props.isOpen}
            type={PanelType.smallFixedFar}
            onDismiss={props.onDismiss}
            isLightDismiss={true}
            headerText={`Feature: ${props.featureName}`}>
            TODO
        </Panel>
    );
};