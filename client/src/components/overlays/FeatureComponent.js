import React from 'react';
import {getSetting} from '../../store/settings';

const FeatureComponent = ({isOpenProp = 'isOpen', onDismissProp = 'onDismiss', doUpdate = false} = {}) =>
    class extends React.Component {
        componentDidMount() {
            if (doUpdate)
                this.interval = window.setInterval(
                    this.forceUpdate.bind(this),
                    getSetting(this.props.settings, 'featureDiagram.overlay.throttleUpdate'));
        }

        componentWillUnmount() {
            if (doUpdate)
                window.clearInterval(this.interval);
        }

        getFeature = () => this.props.featureModel && this.props.featureModel.getFeature(this.props.featureName);

        componentDidUpdate() {
            if (this.props[isOpenProp] && !this.getFeature()) {
                this.props[onDismissProp]();
                //todo: warn user that feature vanished
            }
        }

        renderIfFeature() {
            throw new Error('abstract method not implemented');
        }

        render() {
            this.feature = this.getFeature();
            if (!this.feature)
                return null;
            return this.renderIfFeature(this.feature);
        }
    };

export default FeatureComponent;