import i18n from '../i18n';
import actions from '../store/actions';
import {selectMultipleFeaturesContextualMenuItems} from './overlays/FeatureContextualMenu';
import {layoutTypes, overlayTypes, formatTypes} from '../types';
import {ContextualMenuItemType} from '../../node_modules/office-ui-fabric-react/lib/ContextualMenu';
import {getShortcutText} from '../shortcuts';
import {canExport} from './featureDiagram/export';

const exportFormatItem = (featureDiagramLayout, onShowOverlay, format) =>
    canExport(featureDiagramLayout, format)
        ? [{
            key: format,
            text: i18n.t('featureDiagram.commands', format),
            onClick: () => onShowOverlay(overlayTypes.exportDialog, {format})
        }]
        : [];

const contextualMenuItems = {
    settings: onShowOverlay => ({
        key: 'settings',
        text: i18n.t('commands.settings'),
        iconProps: {iconName: 'Settings'},
        secondaryText: getShortcutText('settings'),
        onClick: () => onShowOverlay(overlayTypes.settingsPanel)
    }),
    about: onShowOverlay => ({
        key: 'about',
        text: i18n.t('commands.about'),
        iconProps: {iconName: 'Info'},
        onClick: () => onShowOverlay(overlayTypes.aboutPanel)
    }),
    featureDiagram: {
        export: (featureDiagramLayout, onShowOverlay) => ({
            key: 'export',
            text: i18n.t('featureDiagram.commands.export'),
            iconProps: {iconName: 'Share'},
            subMenuProps: {
                items: [
                    ...exportFormatItem(featureDiagramLayout, onShowOverlay, formatTypes.png),
                    ...exportFormatItem(featureDiagramLayout, onShowOverlay, formatTypes.jpg),
                    {key: 'divider', itemType: ContextualMenuItemType.Divider},
                    ...exportFormatItem(featureDiagramLayout, onShowOverlay, formatTypes.svg),
                    ...exportFormatItem(featureDiagramLayout, onShowOverlay, formatTypes.pdf)
                ]
            }
        }),
        undo: () => ({
            key: 'undo',
            text: i18n.t('featureDiagram.commands.undo'),
            iconProps: {iconName: 'Undo'},
            secondaryText: getShortcutText('undo'),
            onClick: () => actions.server.undo()
        }),
        redo: () => ({
            key: 'redo',
            text: i18n.t('featureDiagram.commands.redo'),
            iconProps: {iconName: 'Redo'},
            secondaryText: getShortcutText('redo'),
            onClick: () => actions.server.redo()
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
        fitToScreen: onFitToScreen => ({
            key: 'fitToScreen',
            text: i18n.t('featureDiagram.commands.fitToScreen'),
            onClick: onFitToScreen
        }),
        feature: {
            newMenu: (featureName, onClick, iconOnly = false) => ({
                key: 'newMenu',
                text: !iconOnly ? i18n.t('featureDiagram.commands.feature.newMenu.title') : null,
                iconProps: {iconName: 'Add'},
                iconOnly,
                split: true,
                onClick: () => actions.server.feature.addBelow(featureName).then(onClick),
                subMenuProps: {
                    items: [
                        {
                            key: 'newBelow',
                            text: i18n.t('featureDiagram.commands.feature.newMenu.newBelow'),
                            secondaryText: getShortcutText('featureDiagram.feature.new'),
                            iconProps: {iconName: 'Add'},
                            onClick: () => actions.server.feature.addBelow(featureName).then(onClick)
                        },
                        contextualMenuItems.featureDiagram.feature.newAbove([featureName], onClick)
                    ]
                }
            }),
            newAbove: (featureNames, onClick, featureModel) => {
                let disabled = false;
                if (featureNames.length === 0)
                    disabled = true;
                else if (featureNames.length > 1) {
                    if (!featureModel)
                        throw new Error('no feature model given');
                    disabled = !featureModel.isSiblingFeatures(featureNames);
                }
                return ({
                    key: 'newAbove',
                    text: i18n.t('featureDiagram.commands.feature.newMenu.newAbove'),
                    iconProps: {iconName: 'Add'},
                    disabled,
                    onClick: () => actions.server.feature.addAbove(featureNames).then(onClick)
                });
            },
            removeMenu: (feature, onClick, iconOnly = false) => ({
                key: 'removeMenu',
                text: !iconOnly ? i18n.t('featureDiagram.commands.feature.removeMenu.title') : null,
                iconProps: {iconName: 'Remove'},
                iconOnly,
                split: true,
                onClick: () => actions.server.feature.remove(feature.name).then(onClick),
                disabled: feature.isRoot && (!feature.hasChildren || feature.node.children.length > 1),
                subMenuProps: {
                    items: [{
                        key: 'remove',
                        text: i18n.t('featureDiagram.commands.feature.removeMenu.remove'),
                        secondaryText: getShortcutText('featureDiagram.feature.remove'),
                        iconProps: {iconName: 'Remove'},
                        onClick: () => actions.server.feature.remove(feature.name).then(onClick)
                    }, {
                        key: 'removeBelow',
                        text: i18n.t('featureDiagram.commands.feature.removeMenu.removeBelow'),
                        iconProps: {iconName: 'Remove'},
                        disabled: feature.isRoot,
                        onClick: () => actions.server.feature.removeBelow(feature.name).then(onClick)
                    }]
                }
            }),
            details: (featureName, onShowOverlay) => ({
                key: 'details',
                text: i18n.t('featureDiagram.commands.feature.details'),
                secondaryText: getShortcutText('featureDiagram.feature.details'),
                iconProps: {iconName: 'Info'},
                iconOnly: true,
                onClick: () => onShowOverlay(overlayTypes.featurePanel, {featureName})
            }),
            rename: (featureName, onShowOverlay) => ({
                key: 'rename',
                text: i18n.t('featureDiagram.commands.feature.rename'),
                secondaryText: getShortcutText('featureDiagram.feature.rename'),
                iconProps: {iconName: 'Rename'},
                onClick: () => onShowOverlay(overlayTypes.featureRenameDialog, {featureName})
            }),
            setDescription: (featureName, onShowOverlay) => ({
                key: 'setDescription',
                text: i18n.t('featureDiagram.commands.feature.setDescription'),
                iconProps: {iconName: 'TextDocument'},
                onClick: () => onShowOverlay(overlayTypes.featureSetDescriptionDialog, {featureName})
            }),
            properties: (feature, onClick) => {
                const toggleAbstract = () => actions.server.feature.properties.setAbstract(feature.name, !feature.isAbstract).then(onClick),
                    toggleMandatory = () => actions.server.feature.properties.setMandatory(feature.name, !feature.isMandatory).then(onClick),
                    mandatoryDisabled = feature.isRoot || feature.node.parent.feature().isGroup,
                    groupDisabled = !feature.node.children || feature.node.children.length <= 1;
                return ({
                    key: 'propertiesMenu',
                    text: i18n.t('featureDiagram.commands.feature.propertiesMenu.title'),
                    iconProps: {iconName: 'FieldNotChanged'},
                    subMenuProps: {
                        items: [{
                            key: 'abstract',
                            text: i18n.t('featureDiagram.commands.feature.propertiesMenu.abstract'),
                            canCheck: true,
                            isChecked: feature.isAbstract,
                            onClick: toggleAbstract
                        }, {
                            key: 'concrete',
                            text: i18n.t('featureDiagram.commands.feature.propertiesMenu.concrete'),
                            canCheck: true,
                            isChecked: !feature.isAbstract,
                            onClick: toggleAbstract
                        }, {
                            key: 'divider1', itemType: ContextualMenuItemType.Divider
                        }, {
                            key: 'hidden',
                            text: i18n.t('featureDiagram.commands.feature.propertiesMenu.hidden'),
                            canCheck: true,
                            isChecked: feature.isHidden,
                            onClick: () => actions.server.feature.properties.setHidden(feature.name, !feature.isHidden).then(onClick)
                        }, {
                            key: 'divider2', itemType: ContextualMenuItemType.Divider
                        }, {
                            key: 'mandatory',
                            text: i18n.t('featureDiagram.commands.feature.propertiesMenu.mandatory'),
                            disabled: mandatoryDisabled,
                            canCheck: true,
                            isChecked: feature.isMandatory,
                            onClick: toggleMandatory
                        }, {
                            key: 'optional',
                            text: i18n.t('featureDiagram.commands.feature.propertiesMenu.optional'),
                            disabled: mandatoryDisabled,
                            canCheck: true,
                            isChecked: !feature.isMandatory,
                            onClick: toggleMandatory
                        }, {
                            key: 'divider2', itemType: ContextualMenuItemType.Divider
                        }, {
                            key: 'and',
                            text: i18n.t('featureDiagram.commands.feature.propertiesMenu.and'),
                            disabled: groupDisabled,
                            canCheck: true,
                            isChecked: feature.isAnd,
                            onClick: () => actions.server.feature.properties.setAnd(feature.name).then(onClick)
                        }, {
                            key: 'or',
                            text: i18n.t('featureDiagram.commands.feature.propertiesMenu.or'),
                            disabled: groupDisabled,
                            canCheck: true,
                            isChecked: feature.isOr,
                            onClick: () => actions.server.feature.properties.setOr(feature.name).then(onClick)
                        }, {
                            key: 'alternative',
                            text: i18n.t('featureDiagram.commands.feature.propertiesMenu.alternative'),
                            disabled: groupDisabled,
                            canCheck: true,
                            isChecked: feature.isAlternative,
                            onClick: () => actions.server.feature.properties.setAlternative(feature.name).then(onClick)
                        }]
                    }
                });
            },
            selection: (isSelectMultipleFeatures, onSetSelectMultipleFeatures,
                selectedFeatureNames, onDeselectAllFeatures, featureModel) => ({
                key: 'selection',
                text: i18n.t('featureDiagram.commands.feature.selection')(isSelectMultipleFeatures, selectedFeatureNames),
                onClick: () => onSetSelectMultipleFeatures(!isSelectMultipleFeatures), // TODO: tell the user he can choose features now
                subMenuProps: isSelectMultipleFeatures
                    ? {items: selectMultipleFeaturesContextualMenuItems(selectedFeatureNames, onDeselectAllFeatures, featureModel)}
                    : null
            }),
            selectAll: onSelectAll => ({
                key: 'selectAll',
                text: i18n.t('featureDiagram.commands.feature.selectAll'),
                secondaryText: getShortcutText('featureDiagram.feature.selectAll'),
                onClick: onSelectAll
            }),
            deselectAll: onDeselectAll => ({
                key: 'deselectAll',
                text: i18n.t('featureDiagram.commands.feature.deselectAll'),
                secondaryText: getShortcutText('featureDiagram.feature.deselectAll'),
                onClick: onDeselectAll
            }),
            collapseMenu: (feature, onCollapseFeature, onExpandFeature,
                onCollapseFeaturesBelow, onExpandFeaturesBelow, onClick, iconOnly = false) => ({
                key: 'collapseMenu',
                text: !iconOnly ? i18n.t('featureDiagram.commands.feature.collapseMenu.title')(feature.isCollapsed) : null,
                iconProps: {iconName: feature.isCollapsed ? 'ExploreContentSingle' : 'CollapseContentSingle'},
                iconOnly,
                split: true,
                disabled: !feature.hasActualChildren,
                onClick: () => {
                    if (feature.isCollapsed)
                        onExpandFeature(feature.name);
                    else
                        onCollapseFeature(feature.name);
                    onClick();
                },
                subMenuProps: {
                    items: [{
                        key: 'collapse',
                        text: i18n.t('featureDiagram.commands.feature.collapseMenu.collapse')(feature.isCollapsed),
                        secondaryText: feature.isCollapsed
                            ? getShortcutText('featureDiagram.feature.expand')
                            : getShortcutText('featureDiagram.feature.collapse'),
                        iconProps: {iconName: feature.isCollapsed ? 'ExploreContentSingle' : 'CollapseContentSingle'},
                        onClick: () => {
                            if (feature.isCollapsed)
                                onExpandFeature(feature.name);
                            else
                                onCollapseFeature(feature.name);
                            onClick();
                        }
                    }, {
                        key: 'collapseBelow',
                        text: i18n.t('featureDiagram.commands.feature.collapseMenu.collapseBelow'),
                        iconProps: {iconName: 'CollapseContent'},
                        onClick: () => {
                            onCollapseFeaturesBelow(feature.name);
                            onClick();
                        }
                    }, {
                        key: 'expandBelow',
                        text: i18n.t('featureDiagram.commands.feature.collapseMenu.expandBelow'),
                        iconProps: {iconName: 'ExploreContent'},
                        onClick: () => {
                            onExpandFeaturesBelow(feature.name);
                            onClick();
                        }
                    }]
                }
            }),
            collapseAll: onCollapseAllFeatures => ({
                key: 'collapseAll',
                text: i18n.t('featureDiagram.commands.feature.collapseAll'),
                secondaryText: getShortcutText('featureDiagram.feature.collapse'),
                iconProps: {iconName: 'CollapseContent'},
                onClick: onCollapseAllFeatures
            }),
            expandAll: onExpandAllFeatures => ({
                key: 'expandAll',
                text: i18n.t('featureDiagram.commands.feature.expandAll'),
                secondaryText: getShortcutText('featureDiagram.feature.expand'),
                iconProps: {iconName: 'ExploreContent'},
                onClick: onExpandAllFeatures
            })
        }
    }
};

export default contextualMenuItems;