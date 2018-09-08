import React from 'react';
import {DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {ContextualMenu} from 'office-ui-fabric-react/lib/ContextualMenu';
import commands, {makeDivider} from '../commands';
import {getSetting} from '../../store/settings';
import PropTypes from 'prop-types';
import {layoutTypes} from '../../types';
import {LayoutType, SettingsType} from '../../types';
import {FeatureModelType} from '../../server/FeatureModel';
import FeatureComponent from './FeatureComponent';

export default class extends FeatureComponent({doUpdate: true}) {
    static propTypes = {
        onDismiss: PropTypes.func.isRequired,
        onDeselectAllFeatures: PropTypes.func.isRequired,
        onCollapseFeatures: PropTypes.func.isRequired,
        onExpandFeatures: PropTypes.func.isRequired,
        isSelectMultipleFeatures: PropTypes.bool.isRequired,
        selectedFeatureNames: PropTypes.arrayOf(PropTypes.string).isRequired,
        featureModel: FeatureModelType.isRequired,
        featureName: PropTypes.string.isRequired,
        isOpen: PropTypes.bool.isRequired,
        featureDiagramLayout: LayoutType.isRequired,
        onShowOverlay: PropTypes.func.isRequired,
        onCollapseFeaturesBelow: PropTypes.func.isRequired,
        onExpandFeaturesBelow: PropTypes.func.isRequired,
        settings: SettingsType.isRequired
    };

    renderIfFeature(feature) {
        const {
                onDismiss, onDeselectAllFeatures, isSelectMultipleFeatures, selectedFeatureNames, featureModel
            } = this.props,
            {gapSpace} = getSetting(this.props.settings, 'featureDiagram.overlay');
        return (
            <ContextualMenu
                target={featureModel.getElement(feature.name).querySelector('.rectAndText')}
                onDismiss={onDismiss}
                hidden={!this.props.isOpen}
                isBeakVisible={!isSelectMultipleFeatures}
                gapSpace={isSelectMultipleFeatures ? 2 * gapSpace : gapSpace}
                directionalHint={
                    this.props.featureDiagramLayout === layoutTypes.verticalTree
                        ? DirectionalHint.bottomCenter
                        : DirectionalHint.rightCenter}
                items={isSelectMultipleFeatures
                    ? commands.featureDiagram.feature.selectionItems(selectedFeatureNames, onDeselectAllFeatures,
                        this.props.onCollapseFeatures, this.props.onExpandFeatures, this.props.onCollapseFeaturesBelow,
                        this.props.onExpandFeaturesBelow, featureModel)
                    : [
                        commands.featureDiagram.feature.newMenu(feature.name, onDismiss),
                        commands.featureDiagram.feature.removeMenu([feature], onDismiss),
                        commands.featureDiagram.feature.collapseMenu(
                            [feature], this.props.onCollapseFeatures, this.props.onExpandFeatures,
                            this.props.onCollapseFeaturesBelow, this.props.onExpandFeaturesBelow, onDismiss),
                        makeDivider(),
                        commands.featureDiagram.feature.rename(feature.name, this.props.onShowOverlay),
                        commands.featureDiagram.feature.setDescription(feature.name, this.props.onShowOverlay),
                        commands.featureDiagram.feature.properties([feature], onDismiss),
                        makeDivider(),
                        commands.featureDiagram.feature.details(feature.name, this.props.onShowOverlay)
                    ]
                }/>
        );
    }
}
