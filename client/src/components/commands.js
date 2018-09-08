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

export const removeCommand = features => ({
    disabled: features.some(feature => feature.isRoot && (!feature.hasChildren || feature.node.children.length > 1)),
    action: () => actions.server.featureDiagram.feature.remove(
        features.map(feature => feature.name))
});

export const collapseCommand = (features, onCollapseFeatures, onExpandFeatures, onClick) => ({
    disabled: features.some(feature => !feature.hasActualChildren),
    action: fn => {
        const isSingleFeature = features.length === 1,
            featureNames = features.map(feature => feature.name);
        fn = fn || (isSingleFeature && features[0].isCollapsed ? onExpandFeatures : onCollapseFeatures);
        fn(featureNames);
        onClick && onClick();
    }
});

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
            removeMenu: (features, onClick, iconOnly = false) => {
                const {disabled, action} = removeCommand(features);
                return {
                    key: 'removeMenu',
                    text: !iconOnly ? i18n.t('commands.featureDiagram.feature.removeMenu.title') : null,
                    iconProps: {iconName: 'Remove'},
                    iconOnly,
                    split: true,
                    onClick: () => action().then(onClick),
                    disabled,
                    subMenuProps: {
                        items: [{
                            key: 'remove',
                            text: i18n.t('commands.featureDiagram.feature.removeMenu.remove')(features),
                            secondaryText: getShortcutText('featureDiagram.feature.remove'),
                            iconProps: {iconName: 'Remove'},
                            onClick: () => action().then(onClick)
                        }, {
                            key: 'removeBelow',
                            text: i18n.t('commands.featureDiagram.feature.removeMenu.removeBelow'),
                            iconProps: {iconName: 'Remove'},
                            disabled: features.some(feature => feature.isRoot),
                            onClick: () => actions.server.featureDiagram.feature.removeBelow(
                                features.map(feature => feature.name)).then(onClick)
                        }]
                    }
                };
            },
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
            properties: (features, onClick) => {
                const mandatoryDisabled = features.some(feature => feature.isRoot || feature.node.parent.feature().isGroup),
                    groupDisabled = features.some(feature => !feature.node.children || feature.node.children.length <= 1);
                return ({
                    key: 'propertiesMenu',
                    text: i18n.t('commands.featureDiagram.feature.propertiesMenu.title'),
                    iconProps: {iconName: 'FieldNotChanged'},
                    subMenuProps: {
                        items: [{
                            key: 'abstract',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.abstract'),
                            canCheck: true,
                            disabled: features.every(feature => feature.isAbstract),
                            isChecked: features.every(feature => feature.isAbstract),
                            onClick: () => actions.server.featureDiagram.feature.properties.setAbstract(
                                features.map(feature => feature.name), true).then(onClick)
                        }, {
                            key: 'concrete',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.concrete'),
                            canCheck: true,
                            disabled: features.every(feature => !feature.isAbstract),
                            isChecked: features.every(feature => !feature.isAbstract),
                            onClick: () => actions.server.featureDiagram.feature.properties.setAbstract(
                                features.map(feature => feature.name), false).then(onClick)
                        }, makeDivider(), {
                            key: 'hidden',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.hidden'),
                            canCheck: true,
                            isChecked: features.every(feature => feature.isHidden),
                            onClick: () => actions.server.featureDiagram.feature.properties.setHidden(
                                features.map(feature => feature.name), !features.every(feature => feature.isHidden)).then(onClick)
                        }, makeDivider(), {
                            key: 'mandatory',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.mandatory'),
                            canCheck: true,
                            disabled: mandatoryDisabled || features.every(feature => feature.isMandatory),
                            isChecked: features.every(feature => feature.isMandatory),
                            onClick: () => actions.server.featureDiagram.feature.properties.setMandatory(
                                features.map(feature => feature.name), true).then(onClick)
                        }, {
                            key: 'optional',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.optional'),
                            canCheck: true,
                            disabled: mandatoryDisabled || features.every(feature => !feature.isMandatory),
                            isChecked: features.every(feature => !feature.isMandatory),
                            onClick: () => actions.server.featureDiagram.feature.properties.setMandatory(
                                features.map(feature => feature.name), false).then(onClick)
                        }, makeDivider(), {
                            key: 'and',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.and'),
                            canCheck: true,
                            disabled: groupDisabled || features.every(feature => feature.isAnd),
                            isChecked: features.every(feature => feature.isAnd),
                            onClick: () => actions.server.featureDiagram.feature.properties.setAnd(
                                features.map(feature => feature.name)).then(onClick)
                        }, {
                            key: 'or',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.or'),
                            canCheck: true,
                            disabled: groupDisabled || features.every(feature => feature.isOr),
                            isChecked: features.every(feature => feature.isOr),
                            onClick: () => actions.server.featureDiagram.feature.properties.setOr(
                                features.map(feature => feature.name)).then(onClick)
                        }, {
                            key: 'alternative',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.alternative'),
                            canCheck: true,
                            disabled: groupDisabled || features.every(feature => feature.isAlternative),
                            isChecked: features.every(feature => feature.isAlternative),
                            onClick: () => actions.server.featureDiagram.feature.properties.setAlternative(
                                features.map(feature => feature.name)).then(onClick)
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
                    onCollapseFeatures, onExpandFeatures, onCollapseFeaturesBelow, onExpandFeaturesBelow, onDeselectAllFeatures),
                makeDivider(),
                commands.featureDiagram.feature.properties(featureModel.getFeatures(selectedFeatureNames), onDeselectAllFeatures)
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
                    {disabled, action} = collapseCommand(features, onCollapseFeatures, onExpandFeatures, onClick);
                return {
                    key: 'collapseMenu',
                    text: !iconOnly ? i18n.t('commands.featureDiagram.feature.collapseMenu.title')(isCollapsedSingleFeature) : null,
                    iconProps: {iconName: isCollapsedSingleFeature ? 'ExploreContentSingle' : 'CollapseContentSingle'},
                    iconOnly,
                    split: isSingleFeature,
                    disabled,
                    onClick: () => action(),
                    subMenuProps: {
                        items: [
                            ...((isSingleFeature ? [{
                                key: 'collapse',
                                text: i18n.t('commands.featureDiagram.feature.collapseMenu.collapse')(features[0].isCollapsed),
                                secondaryText: features[0].isCollapsed
                                    ? getShortcutText('featureDiagram.feature.expand')
                                    : getShortcutText('featureDiagram.feature.collapse'),
                                iconProps: {iconName: features[0].isCollapsed ? 'ExploreContentSingle' : 'CollapseContentSingle'},
                                onClick: () => action()
                            }] : [{
                                key: 'collapse',
                                text: i18n.t('commands.featureDiagram.feature.collapseMenu.collapseMultiple'),
                                secondaryText: getShortcutText('featureDiagram.feature.collapse'),
                                iconProps: {iconName: 'CollapseContentSingle'},
                                onClick: () => action(onCollapseFeatures)
                            }, {
                                key: 'expand',
                                text: i18n.t('commands.featureDiagram.feature.collapseMenu.expandMultiple'),
                                secondaryText: getShortcutText('featureDiagram.feature.expand'),
                                iconProps: {iconName: 'ExploreContentSingle'},
                                onClick: () => action(onExpandFeatures)
                            }])),
                            makeDivider(), {
                                key: 'collapseBelow',
                                text: i18n.t('commands.featureDiagram.feature.collapseMenu.collapseBelow'),
                                iconProps: {iconName: 'CollapseContent'},
                                onClick: () => action(onCollapseFeaturesBelow)
                            }, {
                                key: 'expandBelow',
                                text: i18n.t('commands.featureDiagram.feature.collapseMenu.expandBelow'),
                                iconProps: {iconName: 'ExploreContent'},
                                onClick: () => action(onExpandFeaturesBelow)
                            }
                        ]
                    }
                };
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