/**
 * A component that is associated with a feature.
 */

import React from 'react';
import {Settings} from '../../store/settings';
import FeatureModel from '../../modeling/FeatureModel';
import {Feature} from '../../modeling/types';

export interface FeatureComponentProps {
    featureModel: FeatureModel,
    featureID?: string,
    settings: Settings
};

function contains(a: DOMRect, b: DOMRect): boolean {
    return b.x >= a.x && b.x + b.width <= a.x + a.width &&
        b.y >= a.y && b.y + b.height <= a.y + a.height;
}

export function isFeatureOffscreen(element: Element) {
    const svgRect = FeatureModel.getSvg().getBoundingClientRect() as DOMRect,
            elementRect = element.getBoundingClientRect() as DOMRect;
    return !contains(svgRect, elementRect);
}

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

        getFeature = () => this.props.featureID && this.props.featureModel &&
            this.props.featureModel.getFeature(this.props.featureID!);

        renderIfFeature(_feature: Feature): JSX.Element | null {
            throw new Error('abstract method not implemented');
        }

        render(): JSX.Element | null {
            let feature = this.getFeature();
            if (typeof feature === 'undefined')
                return null;
            return this.renderIfFeature(this.feature = feature);
        }
    };