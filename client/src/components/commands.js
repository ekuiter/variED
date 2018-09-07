import i18n from '../i18n';
import actions from '../store/actions';
import {layoutTypes, overlayTypes, formatTypes} from '../types';
import {ContextualMenuItemType} from 'office-ui-fabric-react/lib/ContextualMenu';
import {getShortcutText} from '../shortcuts';
import {canExport} from './featureDiagram/export';

const exportFormatItem = (featureDiagramLayout, onShowOverlay, format) =>
    canExport(featureDiagramLayout, format)
        ? [{
            key: format,
            text: i18n.t('commands.featureDiagram', format),
            onClick: () => onShowOverlay(overlayTypes.exportDialog, {format})
        }]
        : [];

export const makeDivider = () =>
    ({key: 'divider', itemType: ContextualMenuItemType.Divider});

const commands = {
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
    undo: () => ({
        key: 'undo',
        text: i18n.t('commands.undo'),
        iconProps: {iconName: 'Undo'},
        secondaryText: getShortcutText('undo'),
        onClick: () => actions.server.undo()
    }),
    redo: () => ({
        key: 'redo',
        text: i18n.t('commands.redo'),
        iconProps: {iconName: 'Redo'},
        secondaryText: getShortcutText('redo'),
        onClick: () => actions.server.redo()
    }),
    featureDiagram: {
        export: (featureDiagramLayout, onShowOverlay) => ({
            key: 'export',
            text: i18n.t('commands.featureDiagram.export'),
            iconProps: {iconName: 'Share'},
            subMenuProps: {
                items: [
                    ...exportFormatItem(featureDiagramLayout, onShowOverlay, formatTypes.png),
                    ...exportFormatItem(featureDiagramLayout, onShowOverlay, formatTypes.jpg),
                    makeDivider(),
                    ...exportFormatItem(featureDiagramLayout, onShowOverlay, formatTypes.svg),
                    ...exportFormatItem(featureDiagramLayout, onShowOverlay, formatTypes.pdf)
                ]
            }
        }),
        setLayout: (featureDiagramLayout, onSetFeatureDiagramLayout) => ({
            key: 'setLayout',
            text: i18n.t('commands.featureDiagram.setLayout'),
            subMenuProps: {
                items: [{
                    key: 'verticalTree',
                    text: i18n.t('commands.featureDiagram.verticalTree'),
                    canCheck: true,
                    isChecked: featureDiagramLayout === layoutTypes.verticalTree,
                    onClick: () => onSetFeatureDiagramLayout(layoutTypes.verticalTree)
                }, {
                    key: 'horizontalTree',
                    text: i18n.t('commands.featureDiagram.horizontalTree'),
                    canCheck: true,
                    isChecked: featureDiagramLayout === layoutTypes.horizontalTree,
                    onClick: () => onSetFeatureDiagramLayout(layoutTypes.horizontalTree)
                }]
            }
        }),
        fitToScreen: onFitToScreen => ({
            key: 'fitToScreen',
            text: i18n.t('commands.featureDiagram.fitToScreen'),
            onClick: onFitToScreen
        }),
        feature: {
            newMenu: (featureName, onClick, iconOnly = false) => ({
                key: 'newMenu',
                text: !iconOnly ? i18n.t('commands.featureDiagram.feature.newMenu.title') : null,
                iconProps: {iconName: 'Add'},
                iconOnly,
                split: true,
                onClick: () => actions.server.featureDiagram.feature.addBelow(featureName).then(onClick),
                subMenuProps: {
                    items: [
                        {
                            key: 'newBelow',
                            text: i18n.t('commands.featureDiagram.feature.newMenu.newBelow'),
                            secondaryText: getShortcutText('featureDiagram.feature.new'),
                            iconProps: {iconName: 'Add'},
                            onClick: () => actions.server.featureDiagram.feature.addBelow(featureName).then(onClick)
                        },
                        commands.featureDiagram.feature.newAbove([featureName], onClick)
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
                    text: i18n.t('commands.featureDiagram.feature.newMenu.newAbove'),
                    iconProps: {iconName: 'Add'},
                    disabled,
                    onClick: () => actions.server.featureDiagram.feature.addAbove(featureNames).then(onClick)
                });
            },
            removeMenu: (features, onClick, iconOnly = false) => ({
                key: 'removeMenu',
                text: !iconOnly ? i18n.t('commands.featureDiagram.feature.removeMenu.title') : null,
                iconProps: {iconName: 'Remove'},
                iconOnly,
                split: true,
                onClick: () => actions.server.featureDiagram.feature.remove(
                    features.map(feature => feature.name)).then(onClick),
                disabled: !!features.find(feature => feature.isRoot && (!feature.hasChildren || feature.node.children.length > 1)),
                subMenuProps: {
                    items: [{
                        key: 'remove',
                        text: i18n.t('commands.featureDiagram.feature.removeMenu.remove')(features),
                        secondaryText: getShortcutText('featureDiagram.feature.remove'),
                        iconProps: {iconName: 'Remove'},
                        onClick: () => actions.server.featureDiagram.feature.remove(
                            features.map(feature => feature.name)).then(onClick)
                    }, {
                        key: 'removeBelow',
                        text: i18n.t('commands.featureDiagram.feature.removeMenu.removeBelow'),
                        iconProps: {iconName: 'Remove'},
                        disabled: !!features.find(feature => feature.isRoot),
                        onClick: () => actions.server.featureDiagram.feature.removeBelow(
                            features.map(feature => feature.name)).then(onClick)
                    }]
                }
            }),
            details: (featureName, onShowOverlay) => ({
                key: 'details',
                text: i18n.t('commands.featureDiagram.feature.details'),
                secondaryText: getShortcutText('featureDiagram.feature.details'),
                iconProps: {iconName: 'Info'},
                iconOnly: true,
                onClick: () => onShowOverlay(overlayTypes.featurePanel, {featureName})
            }),
            rename: (featureName, onShowOverlay) => ({
                key: 'rename',
                text: i18n.t('commands.featureDiagram.feature.rename'),
                secondaryText: getShortcutText('featureDiagram.feature.rename'),
                iconProps: {iconName: 'Rename'},
                onClick: () => onShowOverlay(overlayTypes.featureRenameDialog, {featureName})
            }),
            setDescription: (featureName, onShowOverlay) => ({
                key: 'setDescription',
                text: i18n.t('commands.featureDiagram.feature.setDescription'),
                iconProps: {iconName: 'TextDocument'},
                onClick: () => onShowOverlay(overlayTypes.featureSetDescriptionDialog, {featureName})
            }),
            properties: (feature, onClick) => {
                const toggleAbstract = () => actions.server.featureDiagram.feature.properties.setAbstract(feature.name, !feature.isAbstract).then(onClick),
                    toggleMandatory = () => actions.server.featureDiagram.feature.properties.setMandatory(feature.name, !feature.isMandatory).then(onClick),
                    mandatoryDisabled = feature.isRoot || feature.node.parent.feature().isGroup,
                    groupDisabled = !feature.node.children || feature.node.children.length <= 1;
                return ({
                    key: 'propertiesMenu',
                    text: i18n.t('commands.featureDiagram.feature.propertiesMenu.title'),
                    iconProps: {iconName: 'FieldNotChanged'},
                    subMenuProps: {
                        items: [{
                            key: 'abstract',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.abstract'),
                            canCheck: true,
                            isChecked: feature.isAbstract,
                            onClick: toggleAbstract
                        }, {
                            key: 'concrete',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.concrete'),
                            canCheck: true,
                            isChecked: !feature.isAbstract,
                            onClick: toggleAbstract
                        }, makeDivider(), {
                            key: 'hidden',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.hidden'),
                            canCheck: true,
                            isChecked: feature.isHidden,
                            onClick: () => actions.server.featureDiagram.feature.properties.setHidden(feature.name, !feature.isHidden).then(onClick)
                        }, makeDivider(), {
                            key: 'mandatory',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.mandatory'),
                            disabled: mandatoryDisabled,
                            canCheck: true,
                            isChecked: feature.isMandatory,
                            onClick: toggleMandatory
                        }, {
                            key: 'optional',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.optional'),
                            disabled: mandatoryDisabled,
                            canCheck: true,
                            isChecked: !feature.isMandatory,
                            onClick: toggleMandatory
                        }, makeDivider(), {
                            key: 'and',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.and'),
                            disabled: groupDisabled,
                            canCheck: true,
                            isChecked: feature.isAnd,
                            onClick: () => actions.server.featureDiagram.feature.properties.setAnd(feature.name).then(onClick)
                        }, {
                            key: 'or',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.or'),
                            disabled: groupDisabled,
                            canCheck: true,
                            isChecked: feature.isOr,
                            onClick: () => actions.server.featureDiagram.feature.properties.setOr(feature.name).then(onClick)
                        }, {
                            key: 'alternative',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.alternative'),
                            disabled: groupDisabled,
                            canCheck: true,
                            isChecked: feature.isAlternative,
                            onClick: () => actions.server.featureDiagram.feature.properties.setAlternative(feature.name).then(onClick)
                        }]
                    }
                });
            },
            selection: (isSelectMultipleFeatures, onSetSelectMultipleFeatures,
                selectedFeatureNames, onDeselectAllFeatures, onCollapseFeatures,
                onExpandFeatures, onCollapseFeaturesBelow, onExpandFeaturesBelow, featureModel) => ({
                key: 'selection',
                text: i18n.t('commands.featureDiagram.feature.selection')(isSelectMultipleFeatures, selectedFeatureNames),
                onClick: () => onSetSelectMultipleFeatures(!isSelectMultipleFeatures), // TODO: tell the user he can choose features now
                subMenuProps: isSelectMultipleFeatures
                    ? {items: commands.featureDiagram.feature.selectionItems(selectedFeatureNames, onDeselectAllFeatures,
                        onCollapseFeatures, onExpandFeatures, onCollapseFeaturesBelow, onExpandFeaturesBelow, featureModel)}
                    : null
            }),
            selectionItems: (selectedFeatureNames, onDeselectAllFeatures, onCollapseFeatures,
                onExpandFeatures, onCollapseFeaturesBelow, onExpandFeaturesBelow, featureModel) => [
                commands.featureDiagram.feature.newAbove(selectedFeatureNames, onDeselectAllFeatures, featureModel),
                commands.featureDiagram.feature.removeMenu(featureModel.getFeatures(selectedFeatureNames), onDeselectAllFeatures),
                commands.featureDiagram.feature.collapseMenu(featureModel.getFeatures(selectedFeatureNames),
                    onCollapseFeatures, onExpandFeatures, onCollapseFeaturesBelow, onExpandFeaturesBelow, onDeselectAllFeatures)
            ],
            selectAll: onSelectAll => ({
                key: 'selectAll',
                text: i18n.t('commands.featureDiagram.feature.selectAll'),
                secondaryText: getShortcutText('featureDiagram.feature.selectAll'),
                onClick: onSelectAll
            }),
            deselectAll: onDeselectAll => ({
                key: 'deselectAll',
                text: i18n.t('commands.featureDiagram.feature.deselectAll'),
                secondaryText: getShortcutText('featureDiagram.feature.deselectAll'),
                onClick: onDeselectAll
            }),
            collapseMenu: (features, onCollapseFeatures, onExpandFeatures,
                onCollapseFeaturesBelow, onExpandFeaturesBelow, onClick, iconOnly = false) => {
                const isSingleFeature = features.length === 1,
                    isCollapsedSingleFeature = isSingleFeature && features[0].isCollapsed,
                    featureNames = features.map(feature => feature.name);
                return ({
                    key: 'collapseMenu',
                    text: !iconOnly ? i18n.t('commands.featureDiagram.feature.collapseMenu.title')(isCollapsedSingleFeature) : null,
                    iconProps: {iconName: isCollapsedSingleFeature ? 'ExploreContentSingle' : 'CollapseContentSingle'},
                    iconOnly,
                    split: isSingleFeature,
                    disabled: features.some(feature => !feature.hasActualChildren),
                    onClick: isSingleFeature
                        ? () => {
                            if (features[0].isCollapsed)
                                onExpandFeatures([features[0].name]);
                            else
                                onCollapseFeatures([features[0].name]);
                            onClick();
                        }
                        : null,
                    subMenuProps: {
                        items: [
                            ...isSingleFeature
                                ? [{
                                    key: 'collapse',
                                    text: i18n.t('commands.featureDiagram.feature.collapseMenu.collapse')(features[0].isCollapsed),
                                    secondaryText: features[0].isCollapsed
                                        ? getShortcutText('featureDiagram.feature.expand')
                                        : getShortcutText('featureDiagram.feature.collapse'),
                                    iconProps: {iconName: features[0].isCollapsed ? 'ExploreContentSingle' : 'CollapseContentSingle'},
                                    onClick: () => {
                                        if (features[0].isCollapsed)
                                            onExpandFeatures([features[0].name]);
                                        else
                                            onCollapseFeatures([features[0].name]);
                                        onClick();
                                    }
                                }]
                                : [{
                                    key: 'collapse',
                                    text: i18n.t('commands.featureDiagram.feature.collapseMenu.collapseMultiple'),
                                    secondaryText: getShortcutText('featureDiagram.feature.collapse'),
                                    iconProps: {iconName: 'CollapseContentSingle'},
                                    onClick: () => {
                                        onCollapseFeatures(featureNames);
                                        onClick();
                                    }
                                }, {
                                    key: 'expand',
                                    text: i18n.t('commands.featureDiagram.feature.collapseMenu.expandMultiple'),
                                    secondaryText: getShortcutText('featureDiagram.feature.expand'),
                                    iconProps: {iconName: 'ExploreContentSingle'},
                                    onClick: () => {
                                        onExpandFeatures(featureNames);
                                        onClick();
                                    }
                                }],
                            makeDivider(), {
                                key: 'collapseBelow',
                                text: i18n.t('commands.featureDiagram.feature.collapseMenu.collapseBelow'),
                                iconProps: {iconName: 'CollapseContent'},
                                onClick: () => {
                                    onCollapseFeaturesBelow(featureNames);
                                    onClick();
                                }
                            }, {
                                key: 'expandBelow',
                                text: i18n.t('commands.featureDiagram.feature.collapseMenu.expandBelow'),
                                iconProps: {iconName: 'ExploreContent'},
                                onClick: () => {
                                    onExpandFeaturesBelow(featureNames);
                                    onClick();
                                }
                            }
                        ]
                    }
                });
            },
            collapseAll: onCollapseAllFeatures => ({
                key: 'collapseAll',
                text: i18n.t('commands.featureDiagram.feature.collapseAll'),
                secondaryText: getShortcutText('featureDiagram.feature.collapse'),
                iconProps: {iconName: 'CollapseContent'},
                onClick: onCollapseAllFeatures
            }),
            expandAll: onExpandAllFeatures => ({
                key: 'expandAll',
                text: i18n.t('commands.featureDiagram.feature.expandAll'),
                secondaryText: getShortcutText('featureDiagram.feature.expand'),
                iconProps: {iconName: 'ExploreContent'},
                onClick: onExpandAllFeatures
            })
        }
    }
};

export default commands;