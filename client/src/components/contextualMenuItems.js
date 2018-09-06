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
        selection: (isSelectMultipleFeatures, onSetSelectMultipleFeatures,
            selectedFeatureNames, onDeselectAllFeatures, featureModel) => ({
            key: 'selection',
            text: i18n.t('featureDiagram.commands.selection')(isSelectMultipleFeatures, selectedFeatureNames),
            onClick: () => onSetSelectMultipleFeatures(!isSelectMultipleFeatures), // TODO: tell the user he can choose features now
            subMenuProps: isSelectMultipleFeatures
                ? {items: selectMultipleFeaturesContextualMenuItems(selectedFeatureNames, onDeselectAllFeatures, featureModel)}
                : null
        }),
        feature: {
            new: (featureName, onClick, iconOnly = false) => ({
                key: 'new',
                text: !iconOnly ? i18n.t('featureDiagram.commands.feature.new') : null,
                iconProps: {iconName: 'Add'},
                iconOnly,
                split: true,
                onClick: () => actions.server.feature.addBelow(featureName).then(onClick),
                subMenuProps: {
                    items: [
                        contextualMenuItems.featureDiagram.feature.newFeatureBelow(featureName, onClick),
                        contextualMenuItems.featureDiagram.feature.newFeatureAbove([featureName], onClick)
                    ]
                }
            }),
            newFeatureBelow: (featureName, onClick) => ({
                key: 'newFeatureBelow',
                text: i18n.t('featureDiagram.commands.feature.newFeatureBelow'),
                secondaryText: getShortcutText('featureDiagram.feature.new'),
                iconProps: {iconName: 'Add'},
                onClick: () => actions.server.feature.addBelow(featureName).then(onClick)
            }),
            remove: (feature, onClick, iconOnly = false) => ({
                key: 'remove',
                text: !iconOnly ? i18n.t('featureDiagram.commands.feature.remove') : null,
                iconProps: {iconName: 'Remove'},
                iconOnly,
                split: true,
                onClick: () => actions.server.feature.remove(feature.name).then(onClick),
                disabled: feature.isRoot && (!feature.hasChildren || feature.node.children.length > 1),
                subMenuProps: {
                    items: [
                        contextualMenuItems.featureDiagram.feature.removeFeature(feature, onClick),
                        contextualMenuItems.featureDiagram.feature.removeBelow(feature, onClick)
                    ]
                }
            }),
            removeFeature: (feature, onClick) => ({
                key: 'removeFeature',
                text: i18n.t('featureDiagram.commands.feature.removeFeature'),
                secondaryText: getShortcutText('featureDiagram.feature.remove'),
                iconProps: {iconName: 'Remove'},
                onClick: () => actions.server.feature.remove(feature.name).then(onClick)
            }),
            removeBelow: (feature, onClick) => ({
                key: 'removeBelow',
                text: i18n.t('featureDiagram.commands.feature.removeBelow'),
                iconProps: {iconName: 'Remove'},
                disabled: feature.isRoot,
                onClick: () => actions.server.feature.removeBelow(feature.name).then(onClick)
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
            collapseExpandFeature: (feature, onCollapseFeature, onExpandFeature, onClick) => ({
                key: 'collapseExpandFeature',
                text: i18n.t('featureDiagram.commands.feature.collapseExpandFeature')(feature.isCollapsed),
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
            }),
            collapseExpand: (feature, onCollapseFeature, onExpandFeature,
                onCollapseFeaturesBelow, onExpandFeaturesBelow, onClick, iconOnly = false) => ({
                key: 'collapseExpand',
                text: !iconOnly ? i18n.t('featureDiagram.commands.feature.collapseExpand')(feature.isCollapsed) : null,
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
                    items: [
                        contextualMenuItems.featureDiagram.feature.collapseExpandFeature(
                            feature, onCollapseFeature, onExpandFeature, onClick),
                        contextualMenuItems.featureDiagram.feature.collapseBelow(feature, onCollapseFeaturesBelow, onClick),
                        contextualMenuItems.featureDiagram.feature.expandBelow(feature, onExpandFeaturesBelow, onClick)
                    ]
                }
            }),
            properties: (feature, onClick) => {
                const toggleAbstract = () => actions.server.feature.properties.setAbstract(feature.name, !feature.isAbstract).then(onClick),
                    toggleMandatory = () => actions.server.feature.properties.setMandatory(feature.name, !feature.isMandatory).then(onClick),
                    mandatoryDisabled = feature.isRoot || feature.node.parent.feature().isGroup,
                    groupDisabled = !feature.node.children || feature.node.children.length <= 1;
                return ({
                    key: 'properties',
                    text: i18n.t('featureDiagram.commands.feature.properties'),
                    iconProps: {iconName: 'FieldNotChanged'},
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
                            onClick: () => actions.server.feature.properties.setHidden(feature.name, !feature.isHidden).then(onClick)
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
                            onClick: () => actions.server.feature.properties.setAnd(feature.name).then(onClick)
                        }, {
                            key: 'or',
                            text: i18n.t('featureDiagram.commands.feature.or'),
                            disabled: groupDisabled,
                            canCheck: true,
                            isChecked: feature.isOr,
                            onClick: () => actions.server.feature.properties.setOr(feature.name).then(onClick)
                        }, {
                            key: 'alternative',
                            text: i18n.t('featureDiagram.commands.feature.alternative'),
                            disabled: groupDisabled,
                            canCheck: true,
                            isChecked: feature.isAlternative,
                            onClick: () => actions.server.feature.properties.setAlternative(feature.name).then(onClick)
                        }]
                    }
                });
            },
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
                    text: i18n.t('featureDiagram.commands.feature.newFeatureAbove'),
                    iconProps: {iconName: 'Add'},
                    disabled,
                    onClick: () => actions.server.feature.addAbove(featureNames).then(onClick)
                });
            },
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
            }),
            collapseBelow: (feature, onCollapseFeaturesBelow, onClick) => ({
                key: 'collapseBelow',
                text: i18n.t('featureDiagram.commands.feature.collapseBelow'),
                iconProps: {iconName: 'CollapseContent'},
                onClick: () => {
                    onCollapseFeaturesBelow(feature.name);
                    onClick();
                }
            }),
            expandBelow: (feature, onExpandFeaturesBelow, onClick) => ({
                key: 'expandBelow',
                text: i18n.t('featureDiagram.commands.feature.expandBelow'),
                iconProps: {iconName: 'ExploreContent'},
                onClick: () => {
                    onExpandFeaturesBelow(feature.name);
                    onClick();
                }
            }),
        }
    }
};

export default contextualMenuItems;