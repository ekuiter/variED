import i18n from '../i18n';
import actions from '../store/actions';
import {selectMultipleFeaturesContextualMenuItems} from './overlays/FeatureContextualMenu';
import {overlayTypes} from '../types';

const contextualMenuItems = {
    settings: onShowOverlay => ({
        key: 'settings',
        text: i18n.t('panels.settingsPanel.title'),
        iconOnly: true,
        iconProps: {iconName: 'Settings'},
        onClick: () => onShowOverlay(overlayTypes.settingsPanel)
    }),
    about: onShowOverlay => ({
        key: 'about',
        text: i18n.t('panels.aboutPanel.title'),
        iconOnly: true,
        iconProps: {iconName: 'Info'},
        onClick: () => onShowOverlay(overlayTypes.aboutPanel)
    }),
    featureDiagram: {
        undo: checked => ({
            key: 'undo',
            text: i18n.t('featureDiagram.commands.undo'),
            iconProps: {iconName: 'Undo'},
            onClick: () => actions.server.undo(),
            checked
        }),
        redo: checked => ({
            key: 'redo',
            text: i18n.t('featureDiagram.commands.redo'),
            iconProps: {iconName: 'Redo'},
            onClick: () => actions.server.redo(),
            checked
        }),
        setLayout: (featureDiagramLayout, onSetFeatureDiagramLayout) => ({
            key: 'setLayout',
            text: i18n.t('featureDiagram.commands.setLayout'),
            subMenuProps: {
                items: [{
                    key: 'verticalTree',
                    text: i18n.t('featureDiagram.commands.verticalTree'),
                    canCheck: true,
                    isChecked: featureDiagramLayout === 'verticalTree',
                    onClick: () => onSetFeatureDiagramLayout('verticalTree')
                }, {
                    key: 'horizontalTree',
                    text: i18n.t('featureDiagram.commands.horizontalTree'),
                    canCheck: true,
                    isChecked: featureDiagramLayout === 'horizontalTree',
                    onClick: () => onSetFeatureDiagramLayout('horizontalTree')
                }]
            }
        }),
        selection: (isSelectMultipleFeatures, onSetSelectMultipleFeatures,
                    selectedFeatureNames, onSelectAllFeatures, onDeselectAllFeatures, featureModel) => ({
            key: 'selection',
            text: i18n.t('featureDiagram.commands.selection')(isSelectMultipleFeatures, selectedFeatureNames),
            onClick: () => onSetSelectMultipleFeatures(!isSelectMultipleFeatures), // TODO: tell the user he can choose features now
            subMenuProps: isSelectMultipleFeatures
                ? {
                    items: selectMultipleFeaturesContextualMenuItems(
                        selectedFeatureNames, onSelectAllFeatures, onDeselectAllFeatures, featureModel)
                }
                : null
        }),
        feature: {
            new: (featureName, onClick) => ({
                key: 'new',
                text: i18n.t('featureDiagram.commands.feature.new'),
                iconProps: {iconName: 'Add'},
                split: true,
                onClick: () => actions.server.feature.addBelow(featureName).then(onClick),
                subMenuProps: {
                    items: [
                        contextualMenuItems.featureDiagram.feature.newFeatureBelow(featureName, onClick),
                        contextualMenuItems.featureDiagram.features.newFeatureAbove([featureName], onClick)
                    ]
                }
            }),
            newFeatureBelow: (featureName, onClick) => ({
                key: 'newFeatureBelow',
                text: i18n.t('featureDiagram.commands.feature.newFeatureBelow'),
                iconProps: {iconName: 'Add'},
                onClick: () => actions.server.feature.addBelow(featureName).then(onClick)
            }),
            remove: (featureName, onClick) => ({
                key: 'remove',
                text: i18n.t('featureDiagram.commands.feature.remove'),
                iconProps: {iconName: 'Remove'},
                onClick: () => actions.server.feature.remove(featureName).then(onClick)
            }),
            details: (featureName, onShowOverlay) => ({
                key: 'details',
                text: i18n.t('featureDiagram.commands.feature.details'),
                iconProps: {iconName: 'Info'},
                iconOnly: true,
                onClick: () => onShowOverlay(overlayTypes.featurePanel, {featureName})
            }),
            rename: (featureName, onShowOverlay) => ({
                key: 'rename',
                text: i18n.t('featureDiagram.commands.feature.rename'),
                iconProps: {iconName: 'Rename'},
                onClick: () => onShowOverlay(overlayTypes.featureRenameDialog, {featureName})
            }),
            setDescription: (featureName, onShowOverlay) => ({
                key: 'setDescription',
                text: i18n.t('featureDiagram.commands.feature.setDescription'),
                iconProps: {iconName: 'TextDocument'},
                onClick: () => onShowOverlay(overlayTypes.featureSetDescriptionDialog, {featureName})
            })
        },
        features: {
            selectAll: onSelectAll => ({
                key: 'selectAll',
                text: i18n.t('featureDiagram.commands.features.selectAll'),
                onClick: onSelectAll
            }),
            deselectAll: onDeselectAll => ({
                key: 'deselectAll',
                text: i18n.t('featureDiagram.commands.features.deselectAll'),
                onClick: onDeselectAll
            }),
            newFeatureAbove: (featureNames, onClick, featureModel) => {
                let disabled = false;
                if (featureNames.length === 0)
                    disabled = true;
                else if (featureNames.length > 1) {
                    if (!featureModel)
                        throw new Error('no feature model given');
                    disabled = !featureModel.isSiblingFeatures(featureNames);
                }
                return ({
                    key: 'featureAbove',
                    text: i18n.t('featureDiagram.commands.features.newFeatureAbove'),
                    iconProps: {iconName: 'Add'},
                    disabled,
                    onClick: () => actions.server.feature.addAbove(featureNames).then(onClick)
                });
            }
        }
    }
};

export default contextualMenuItems;