import React from 'react';
import {DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {ContextualMenu, ContextualMenuItemType} from 'office-ui-fabric-react/lib/ContextualMenu';
import contextualMenuItems from '../contextualMenuItems';
import {getSetting} from '../../store/settings';
import PropTypes from 'prop-types';
import {layoutTypes} from '../../types';
import {LayoutType, SettingsType} from '../../types';
import {FeatureModelType} from '../../server/FeatureModel';
import FeatureComponent from './FeatureComponent';

export const selectMultipleFeaturesContextualMenuItems = (selectedFeatureNames, onSelectAllFeatures, onDeselectAllFeatures, featureModel) => [
    contextualMenuItems.featureDiagram.features.selectAll(onSelectAllFeatures),
    contextualMenuItems.featureDiagram.features.deselectAll(onDeselectAllFeatures),
    {key: 'divider1', itemType: ContextualMenuItemType.Divider},
    contextualMenuItems.featureDiagram.features.newFeatureAbove(selectedFeatureNames, onDeselectAllFeatures, featureModel)
];

class FeatureContextualMenu extends FeatureComponent({doUpdate: true}) {
    renderIfFeature(feature) {
        const {
                onDismiss, onSelectAllFeatures, onDeselectAllFeatures,
                isSelectMultipleFeatures, selectedFeatureNames, featureModel
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
                    ? selectMultipleFeaturesContextualMenuItems(
                        selectedFeatureNames, onSelectAllFeatures, onDeselectAllFeatures, featureModel)
                    : [
                        contextualMenuItems.featureDiagram.feature.new(feature.name, onDismiss),
                        contextualMenuItems.featureDiagram.feature.remove(feature.name, onDismiss),
                        {key: 'divider1', itemType: ContextualMenuItemType.Divider},
                        contextualMenuItems.featureDiagram.feature.rename(feature.name, this.props.onShowOverlay),
                        contextualMenuItems.featureDiagram.feature.setDescription(feature.name, this.props.onShowOverlay),
                        {key: 'divider2', itemType: ContextualMenuItemType.Divider},
                        contextualMenuItems.featureDiagram.feature.details(feature.name, this.props.onShowOverlay)
                    ]
                }/>
        );
    }
}

FeatureContextualMenu.propTypes = {
    onDismiss: PropTypes.func.isRequired,
    onSelectAllFeatures: PropTypes.func.isRequired,
    onDeselectAllFeatures: PropTypes.func.isRequired,
    isSelectMultipleFeatures: PropTypes.bool.isRequired,
    selectedFeatureNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    featureModel: FeatureModelType.isRequired,
    featureName: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    featureDiagramLayout: LayoutType.isRequired,
    onShowOverlay: PropTypes.func.isRequired,
    settings: SettingsType.isRequired
};

export default FeatureContextualMenu;