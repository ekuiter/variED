import React from 'react';
import {Callout, DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {getSetting} from '../../store/settings';
import contextualMenuItems from '../contextualMenuItems';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';

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
        const {onDismiss, featureModel, featureName} = this.props,
            {gapSpace, width} = getSetting(this.props.settings, 'featureDiagram.overlay');
        const feature = featureModel && featureModel.getFeatureOrDismiss(featureName, this.props.isOpen, onDismiss);
        if (!feature)
            return null;
        return (
            <Callout target={featureModel.getElement(featureName)}
                     onDismiss={onDismiss}
                     hidden={!this.props.isOpen}
                     gapSpace={gapSpace}
                     calloutWidth={width}
                     directionalHint={
                         this.props.featureDiagramLayout === 'verticalTree'
                             ? DirectionalHint.bottomCenter
                             : DirectionalHint.rightCenter}>
                <div className="callout">
                    <div className="header">
                        <p>{feature.name}</p>
                    </div>
                    {feature.description
                        ? <div className="inner">
                            <p>{feature.description}</p>
                        </div>
                        : <div className="inner empty"/>}
                    <CommandBar
                        items={[
                            contextualMenuItems.featureDiagram.feature.new(feature.name, onDismiss),
                            contextualMenuItems.featureDiagram.feature.remove(feature.name, onDismiss)
                        ]}
                        farItems={[
                            contextualMenuItems.featureDiagram.feature.details(feature.name, this.props.onShowOverlay)
                        ]}/>
                </div>
            </Callout>
        );
    }
}