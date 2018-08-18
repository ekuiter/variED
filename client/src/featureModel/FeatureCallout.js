import React from 'react';
import {Callout, DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import Constants from '../Constants';

export default class extends React.Component {
    render() {
        return (
            <Callout target={this.props.nodeRef}
                     onDismiss={this.props.onDismiss}
                     hidden={!this.props.node}
                     gapSpace={Constants.treeLayout.featureCallout.gapSpace}
                     directionalHint={
                         this.props.direction === 'vertical'
                             ? DirectionalHint.bottomCenter
                             : DirectionalHint.rightCenter}>
                {this.props.node && <h3>{this.props.node.feature().name}</h3>}
            </Callout>
        );
    }
};