/**
 * A component that is associated with a feature.
 */

import React from 'react';
import {Settings} from '../../store/settings';
import FeatureModel from '../../server/FeatureModel';
import {Feature} from '../../types';

export interface FeatureComponentProps {
    featureModel: FeatureModel,
    featureName?: string,
    settings: Settings
};

export default ({doUpdate = false} = {}) =>
    class <Props extends FeatureComponentProps> extends React.Component<Props> {
        interval: number;
        feature: Feature;

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

        getFeature = () => this.props.featureName && this.props.featureModel.getFeature(this.props.featureName!);

        renderIfFeature(_feature: Feature): JSX.Element {
            throw new Error('abstract method not implemented');
        }

        render(): JSX.Element | null {
            let feature = this.getFeature();
            if (typeof feature === 'undefined')
                return null;
            return this.renderIfFeature(this.feature = feature);
        }
    };