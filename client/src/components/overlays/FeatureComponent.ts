/**
 * A component that is associated with a feature.
 */

import React from 'react';
import {Settings} from '../../store/settings';
import GraphicalFeatureModel from '../../modeling/GraphicalFeatureModel';
import {GraphicalFeature} from '../../modeling/types';

export interface FeatureComponentProps {
    graphicalFeatureModel: GraphicalFeatureModel,
    featureUUID?: string,
    settings: Settings
};

export default ({doUpdate = false} = {}) =>
    class <Props extends FeatureComponentProps> extends React.Component<Props> {
        interval: number;
        feature: GraphicalFeature;

        componentDidMount() {
            if (doUpdate)
                this.interval = window.setInterval(
                    () => this.forceUpdate(),
                    this.props.settings.featureDiagram.overlay.throttleUpdate);
        }

        componentWillUnmount() {
            if (doUpdate)
                window.clearInterval(this.interval);
        }

        getFeature = () => this.props.featureUUID && this.props.graphicalFeatureModel.getFeature(this.props.featureUUID!);

        renderIfFeature(_feature: GraphicalFeature): JSX.Element | null {
            throw new Error('abstract method not implemented');
        }

        render(): JSX.Element | null {
            let feature = this.getFeature();
            if (typeof feature === 'undefined')
                return null;
            return this.renderIfFeature(this.feature = feature);
        }
    };