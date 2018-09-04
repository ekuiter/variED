import React from 'react';
import {getSetting} from '../../store/settings';
import PropTypes from 'prop-types';
import {FeatureModelType} from '../../server/FeatureModel';
import {SettingsType} from '../../types';

export default ({doUpdate = false} = {}) =>
    class extends React.Component {
        static propTypes = {
            featureModel: FeatureModelType.isRequired,
            featureName: PropTypes.string.isRequired,
            settings: SettingsType.isRequired
        };

        componentDidMount() {
            if (doUpdate)
                this.interval = window.setInterval(
                    () => this.forceUpdate(),
                    getSetting(this.props.settings, 'featureDiagram.overlay.throttleUpdate'));
        }

        componentWillUnmount() {
            if (doUpdate)
                window.clearInterval(this.interval);
        }

        getFeature = () => this.props.featureModel && this.props.featureModel.getFeature(this.props.featureName);

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