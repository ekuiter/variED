/**
 * A Fabric callout that includes information about a feature.
 */

import React from 'react';
import {Callout, DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {getSetting} from '../../store/settings';
import commands from '../commands';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';
import PropTypes from 'prop-types';
import {layoutTypes} from '../../types';
import {LayoutType, SettingsType} from '../../types';
import {FeatureModelType} from '../../server/FeatureModel';
import FeatureComponent from './FeatureComponent';

export default class extends FeatureComponent({doUpdate: true}) {
    static propTypes = {
        onDismiss: PropTypes.func.isRequired,
        featureModel: FeatureModelType.isRequired,
        featureName: PropTypes.string.isRequired,
        isOpen: PropTypes.bool.isRequired,
        featureDiagramLayout: LayoutType.isRequired,
        onShowOverlay: PropTypes.func.isRequired,
        onCollapseFeatures: PropTypes.func.isRequired,
        onExpandFeatures: PropTypes.func.isRequired,
        onCollapseFeaturesBelow: PropTypes.func.isRequired,
        onExpandFeaturesBelow: PropTypes.func.isRequired,
        settings: SettingsType.isRequired
    };

    renderIfFeature(feature) {
        const {onDismiss, featureModel} = this.props,
            {gapSpace, width} = getSetting(this.props.settings, 'featureDiagram.overlay');
        return (
            <Callout target={featureModel.getElement(feature.name).querySelector('.rectAndText')}
                onDismiss={onDismiss}
                hidden={!this.props.isOpen}
                gapSpace={gapSpace}
                calloutWidth={width}
                directionalHint={
                    this.props.featureDiagramLayout === layoutTypes.verticalTree
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
                            commands.featureDiagram.feature.newMenu(feature.name, onDismiss, true),
                            commands.featureDiagram.feature.removeMenu([feature], onDismiss, true),
                            commands.featureDiagram.feature.collapseMenu(
                                [feature], this.props.onCollapseFeatures, this.props.onExpandFeatures,
                                this.props.onCollapseFeaturesBelow, this.props.onExpandFeaturesBelow, onDismiss, true),
                        ]}
                        farItems={[
                            commands.featureDiagram.feature.details(feature.name, this.props.onShowOverlay)
                        ]}/>
                </div>
            </Callout>
        );
    }
}