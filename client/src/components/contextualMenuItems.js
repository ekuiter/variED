import i18n from '../i18n';
import actions from '../store/actions';
import {selectMultipleFeaturesContextualMenuItems} from './overlays/FeatureContextualMenu';
import {layoutTypes, overlayTypes} from '../types';
import {ContextualMenuItemType} from '../../node_modules/office-ui-fabric-react/lib/ContextualMenu';

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
                    isChecked: featureDiagramLayout === layoutTypes.verticalTree,
                    onClick: () => onSetFeatureDiagramLayout(layoutTypes.verticalTree)
                }, {
                    key: 'horizontalTree',
                    text: i18n.t('featureDiagram.commands.horizontalTree'),
                    canCheck: true,
                    isChecked: featureDiagramLayout === layoutTypes.horizontalTree,
                    onClick: () => onSetFeatureDiagramLayout(layoutTypes.horizontalTree)
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
            }),
            properties: feature => {
                const toggleAbstract = () => actions.server.feature.properties.setAbstract(feature.name, !feature.isAbstract),
                    toggleMandatory = () => actions.server.feature.properties.setMandatory(feature.name, !feature.isMandatory),
                    mandatoryDisabled = feature.node.parent === null || feature.node.parent.feature().isGroup,
                    groupDisabled = !feature.node.children || feature.node.children.length <= 1;
                return ({
                    key: 'properties',
                    text: i18n.t('featureDiagram.commands.feature.properties'),
                    subMenuProps: {
                        items: [{
                            key: 'abstract',
                            text: i18n.t('featureDiagram.commands.feature.abstract'),
                            canCheck: true,
                            isChecked: feature.isAbstract,
                            onClick: toggleAbstract
                        }, {
                            key: 'concrete',
                            text: i18n.t('featureDiagram.commands.feature.concrete'),
                            canCheck: true,
                            isChecked: !feature.isAbstract,
                            onClick: toggleAbstract
                        }, {
                            key: 'divider1', itemType: ContextualMenuItemType.Divider
                        }, {
                            key: 'hidden',
                            text: i18n.t('featureDiagram.commands.feature.hidden'),
                            canCheck: true,
                            isChecked: feature.isHidden,
                            onClick: () => actions.server.feature.properties.setHidden(feature.name, !feature.isHidden)
                        }, {
                            key: 'divider2', itemType: ContextualMenuItemType.Divider
                        }, {
                            key: 'mandatory',
                            text: i18n.t('featureDiagram.commands.feature.mandatory'),
                            disabled: mandatoryDisabled,
                            canCheck: true,
                            isChecked: feature.isMandatory,
                            onClick: toggleMandatory
                        }, {
                            key: 'optional',
                            text: i18n.t('featureDiagram.commands.feature.optional'),
                            disabled: mandatoryDisabled,
                            canCheck: true,
                            isChecked: !feature.isMandatory,
                            onClick: toggleMandatory
                        }, {
                            key: 'divider2', itemType: ContextualMenuItemType.Divider
                        }, {
                            key: 'and',
                            text: i18n.t('featureDiagram.commands.feature.and'),
                            disabled: groupDisabled,
                            canCheck: true,
                            isChecked: feature.isAnd,
                            onClick: () => actions.server.feature.properties.setAnd(feature.name)
                        }, {
                            key: 'or',
                            text: i18n.t('featureDiagram.commands.feature.or'),
                            disabled: groupDisabled,
                            canCheck: true,
                            isChecked: feature.isOr,
                            onClick: () => actions.server.feature.properties.setOr(feature.name)
                        }, {
                            key: 'alternative',
                            text: i18n.t('featureDiagram.commands.feature.alternative'),
                            disabled: groupDisabled,
                            canCheck: true,
                            isChecked: feature.isAlternative,
                            onClick: () => actions.server.feature.properties.setAlternative(feature.name)
                        }]
                    }
                });
            }
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
                    onClick: () => actions.server.features.addAbove(featureNames).then(onClick)
                });
            }
        }
    }
};

export default contextualMenuItems;