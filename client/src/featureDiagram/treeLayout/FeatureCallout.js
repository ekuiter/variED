import React from 'react';
import {Callout, DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {getSetting} from '../../settings';

export default class extends React.Component {
    render() {
        return (
            <Callout target={this.props.nodeRef}
                     onDismiss={this.props.onDismiss}
                     hidden={!this.props.node}
                     gapSpace={getSetting(this.props.settings, 'featureDiagram.treeLayout.featureCallout.gapSpace')}
                     directionalHint={
                         this.props.direction === 'vertical'
                             ? DirectionalHint.bottomCenter
                             : DirectionalHint.rightCenter}>
                {this.props.node && <h3>{this.props.node.feature().name}</h3>}
            </Callout>
        );
    }
};