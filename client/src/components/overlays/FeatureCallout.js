import React from 'react';
import {Callout, DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {getSetting} from '../../store/settings';
import contextualMenuItems from '../contextualMenuItems';
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
        onCollapseFeature: PropTypes.func.isRequired,
        onExpandFeature: PropTypes.func.isRequired,
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
                            contextualMenuItems.featureDiagram.feature.new(feature.name, onDismiss),
                            contextualMenuItems.featureDiagram.feature.remove(feature.name, onDismiss),
                            contextualMenuItems.featureDiagram.feature.collapseExpand(
                                feature, this.props.onCollapseFeature, this.props.onExpandFeature, onDismiss),
                        ]}
                        farItems={[
                            contextualMenuItems.featureDiagram.feature.details(feature.name, this.props.onShowOverlay)
                        ]}/>
                </div>
            </Callout>
        );
    }
}