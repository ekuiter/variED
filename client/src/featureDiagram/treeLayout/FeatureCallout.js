import React from 'react';
import {Callout, DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';
import {getSetting} from '../../settings';
import CommandBarItems from '../../CommandBarItems';

export default class extends React.Component {
    static defaultProps = {
        node: null, nodeRef: null, onDismiss: null, settings: null, direction: null
    };

    render() {
        const onDismiss = this.props.onDismiss,
            {gapSpace, width} = getSetting(this.props.settings, 'featureDiagram.treeLayout.featureCallout'),
            feature = this.props.node && this.props.node.feature();
        if (!feature)
            return null;
        return (
            <Callout target={this.props.nodeRef}
                     onDismiss={onDismiss}
                     hidden={!this.props.node}
                     gapSpace={gapSpace}
                     calloutWidth={width}
                     directionalHint={
                         this.props.direction === 'vertical'
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
                            CommandBarItems.featureDiagram.new(feature, onDismiss),
                            CommandBarItems.featureDiagram.remove(feature, onDismiss)
                        ]}
                        overflowItems={[
                            CommandBarItems.featureDiagram.rename(feature),
                            CommandBarItems.featureDiagram.changeDescription(feature)
                        ]}/>
                </div>
            </Callout>
        );
    }
};