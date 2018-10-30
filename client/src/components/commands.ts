/**
 * Defines commands (actions and metadata) that may be used throughout the application.
 * Commands are expected to be used in Fabric's contextual menus and command bars
 * and defined accordingly.
 */

import i18n from '../i18n';
import {FeatureDiagramLayoutType, OverlayType, FormatType, Feature} from '../types';
import {ContextualMenuItemType} from 'office-ui-fabric-react/lib/ContextualMenu';
import {getShortcutText} from '../shortcuts';
import {canExport} from './featureDiagram/export';
import {OnShowOverlayFunction, OnCollapseFeaturesFunction, OnExpandFeaturesFunction, OnSetFeatureDiagramLayoutFunction, OnFitToScreenFunction, OnDeselectAllFeaturesFunction, OnCollapseFeaturesBelowFunction, OnExpandFeaturesBelowFunction, OnSetSelectMultipleFeaturesFunction, OnSelectAllFeaturesFunction, OnCollapseAllFeaturesFunction, OnExpandAllFeaturesFunction, OnRemoveFeaturesFunction, OnUndoFunction, OnRedoFunction, OnAddFeatureBelowFunction, OnAddFeatureAboveFunction, OnRemoveFeaturesBelowFunction, OnSetFeatureAbstractFunction, OnSetFeatureHiddenFunction, OnSetFeatureMandatoryFunction, OnSetFeatureAndFunction, OnSetFeatureOrFunction, OnSetFeatureAlternativeFunction} from '../store/types';
import FeatureModel from '../server/FeatureModel';

const exportFormatItem = (featureDiagramLayout: FeatureDiagramLayoutType,
    onShowOverlay: OnShowOverlayFunction, format: FormatType) =>
    canExport(featureDiagramLayout, format)
        ? [{
            key: format,
            text: i18n.t('commands.featureDiagram', format),
            onClick: () => onShowOverlay({overlay: OverlayType.exportDialog, overlayProps: {format}})
        }]
        : [];

export const makeDivider = () =>
    ({key: 'divider', itemType: ContextualMenuItemType.Divider});

export const removeCommand = (features: Feature[], onRemoveFeatures: OnRemoveFeaturesFunction) => ({
    disabled: features.some(feature => feature.isRoot && (!feature.hasChildren || feature.node.children!.length > 1)),
    action: () => onRemoveFeatures({featureNames: features.map(feature => feature.name)})
});

export const collapseCommand = (features: Feature[], onCollapseFeatures: OnCollapseFeaturesFunction,
    onExpandFeatures: OnExpandFeaturesFunction, onClick?: () => void) => ({
    disabled: features.some(feature => !feature.hasActualChildren),
    action: (fn?: OnCollapseFeaturesFunction | OnExpandFeaturesFunction) => {
        const isSingleFeature = features.length === 1,
            featureNames = features.map(feature => feature.name);
        fn = fn || (isSingleFeature && features[0].isCollapsed ? onExpandFeatures : onCollapseFeatures);
        fn({featureNames});
        onClick && onClick();
    }
});

const commands = {
    commandPalette: (onShowOverlay: OnShowOverlayFunction) => ({
        key: 'commandPalette',
        text: i18n.t('commands.commandPalette'),
        secondaryText: getShortcutText('commandPalette'),
        onClick: () => onShowOverlay({overlay: OverlayType.commandPalette, overlayProps: {}})
    }),
    settings: (onShowOverlay: OnShowOverlayFunction) => ({
        key: 'settings',
        text: i18n.t('commands.settings'),
        iconProps: {iconName: 'Settings'},
        secondaryText: getShortcutText('settings'),
        onClick: () => onShowOverlay({overlay: OverlayType.settingsPanel, overlayProps: {}})
    }),
    about: (onShowOverlay: OnShowOverlayFunction) => ({
        key: 'about',
        text: i18n.t('commands.about'),
        iconProps: {iconName: 'Info'},
        onClick: () => onShowOverlay({overlay: OverlayType.aboutPanel, overlayProps: {}})
    }),
    undo: (onUndo: OnUndoFunction) => ({
        key: 'undo',
        text: i18n.t('commands.undo'),
        iconProps: {iconName: 'Undo'},
        secondaryText: getShortcutText('undo'),
        onClick: onUndo
    }),
    redo: (onRedo: OnRedoFunction) => ({
        key: 'redo',
        text: i18n.t('commands.redo'),
        iconProps: {iconName: 'Redo'},
        secondaryText: getShortcutText('redo'),
        onClick: onRedo
    }),
    featureDiagram: {
        export: (featureDiagramLayout: FeatureDiagramLayoutType, onShowOverlay: OnShowOverlayFunction) => ({
            key: 'export',
            text: i18n.t('commands.featureDiagram.export'),
            iconProps: {iconName: 'Share'},
            subMenuProps: {
                items: [
                    ...exportFormatItem(featureDiagramLayout, onShowOverlay, FormatType.png),
                    ...exportFormatItem(featureDiagramLayout, onShowOverlay, FormatType.jpg),
                    makeDivider(),
                    ...exportFormatItem(featureDiagramLayout, onShowOverlay, FormatType.svg),
                    ...exportFormatItem(featureDiagramLayout, onShowOverlay, FormatType.pdf)
                ]
            }
        }),
        setLayout: (featureDiagramLayout: FeatureDiagramLayoutType,
            onSetFeatureDiagramLayout: OnSetFeatureDiagramLayoutFunction) => ({
            key: 'setLayout',
            text: i18n.t('commands.featureDiagram.setLayout'),
            subMenuProps: {
                items: [{
                    key: 'verticalTree',
                    text: i18n.t('commands.featureDiagram.verticalTree'),
                    canCheck: true,
                    isChecked: featureDiagramLayout === FeatureDiagramLayoutType.verticalTree,
                    onClick: () => onSetFeatureDiagramLayout({layout: FeatureDiagramLayoutType.verticalTree})
                }, {
                    key: 'horizontalTree',
                    text: i18n.t('commands.featureDiagram.horizontalTree'),
                    canCheck: true,
                    isChecked: featureDiagramLayout === FeatureDiagramLayoutType.horizontalTree,
                    onClick: () => onSetFeatureDiagramLayout({layout: FeatureDiagramLayoutType.horizontalTree})
                }]
            }
        }),
        fitToScreen: (onFitToScreen: OnFitToScreenFunction) => ({
            key: 'fitToScreen',
            text: i18n.t('commands.featureDiagram.fitToScreen'),
            iconProps: {iconName: 'FullScreen'},
            onClick: onFitToScreen
        }),
        feature: {
            newMenu: (featureName: string, onAddFeatureBelow: OnAddFeatureBelowFunction,
                onAddFeatureAbove: OnAddFeatureAboveFunction, onClick: () => void, iconOnly = false) => ({
                key: 'newMenu',
                text: !iconOnly ? i18n.t('commands.featureDiagram.feature.newMenu.title') : undefined,
                iconProps: {iconName: 'Add'},
                iconOnly,
                split: true,
                onClick: () => {
                    onAddFeatureBelow({belowFeatureName: featureName}).then(onClick);
                },
                subMenuProps: {
                    items: [
                        {
                            key: 'newBelow',
                            text: i18n.t('commands.featureDiagram.feature.newMenu.newBelow'),
                            secondaryText: getShortcutText('featureDiagram.feature.new'),
                            iconProps: {iconName: 'Add'},
                            onClick: () => {
                                onAddFeatureBelow({belowFeatureName: featureName}).then(onClick);
                            }
                        },
                        commands.featureDiagram.feature.newAbove([featureName], onAddFeatureAbove, onClick)
                    ]
                }
            }),
            newAbove: (featureNames: string[], onAddFeatureAbove: OnAddFeatureAboveFunction,
                onClick: () => void, featureModel?: FeatureModel) => {
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
                    onClick: () => {
                        onAddFeatureAbove({aboveFeatureNames: featureNames}).then(onClick);
                    }
                });
            },
            removeMenu: (features: Feature[], onRemoveFeatures: OnRemoveFeaturesFunction,
                onRemoveFeaturesBelow: OnRemoveFeaturesBelowFunction, onClick: () => void, iconOnly = false) => {
                const {disabled, action} = removeCommand(features, onRemoveFeatures);
                return {
                    key: 'removeMenu',
                    text: !iconOnly ? i18n.t('commands.featureDiagram.feature.removeMenu.title') : undefined,
                    iconProps: {iconName: 'Remove'},
                    iconOnly,
                    split: true,
                    onClick: () => {
                        action().then(onClick);
                    },
                    disabled,
                    subMenuProps: {
                        items: [{
                            key: 'remove',
                            text: i18n.getFunction('commands.featureDiagram.feature.removeMenu.remove')(features),
                            secondaryText: getShortcutText('featureDiagram.feature.remove'),
                            iconProps: {iconName: 'Remove'},
                            onClick: () => {
                                action().then(onClick);
                            }
                        }, {
                            key: 'removeBelow',
                            text: i18n.t('commands.featureDiagram.feature.removeMenu.removeBelow'),
                            iconProps: {iconName: 'Remove'},
                            disabled: features.some(feature => feature.isRoot),
                            onClick: () => {
                                onRemoveFeaturesBelow({featureNames: features.map(feature => feature.name)}).then(onClick);
                            }
                        }]
                    }
                };
            },
            details: (featureName: string, onShowOverlay: OnShowOverlayFunction) => ({
                key: 'details',
                text: i18n.t('commands.featureDiagram.feature.details'),
                secondaryText: getShortcutText('featureDiagram.feature.details'),
                iconProps: {iconName: 'Info'},
                iconOnly: true,
                onClick: () => onShowOverlay({overlay: OverlayType.featurePanel, overlayProps: {featureName}})
            }),
            rename: (featureName: string, onShowOverlay: OnShowOverlayFunction) => ({
                key: 'rename',
                text: i18n.t('commands.featureDiagram.feature.rename'),
                secondaryText: getShortcutText('featureDiagram.feature.rename'),
                iconProps: {iconName: 'Rename'},
                onClick: () => onShowOverlay({overlay: OverlayType.featureRenameDialog, overlayProps: {featureName}})
            }),
            setDescription: (featureName: string, onShowOverlay: OnShowOverlayFunction) => ({
                key: 'setDescription',
                text: i18n.t('commands.featureDiagram.feature.setDescription'),
                iconProps: {iconName: 'TextDocument'},
                onClick: () => onShowOverlay({overlay: OverlayType.featureSetDescriptionDialog, overlayProps: {featureName}})
            }),
            properties: (features: Feature[], onSetFeatureAbstract: OnSetFeatureAbstractFunction,
                onSetFeatureHidden: OnSetFeatureHiddenFunction, onSetFeatureMandatory: OnSetFeatureMandatoryFunction,
                onSetFeatureAnd: OnSetFeatureAndFunction, onSetFeatureOr: OnSetFeatureOrFunction,
                onSetFeatureAlternative: OnSetFeatureAlternativeFunction, onClick: () => void) => {
                const mandatoryDisabled = features.some(feature => feature.isRoot || feature.node.parent!.feature().isGroup),
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
                            onClick: () => {
                                onSetFeatureAbstract({featureNames: features.map(feature => feature.name), value: true}).then(onClick);
                            }
                        }, {
                            key: 'concrete',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.concrete'),
                            canCheck: true,
                            disabled: features.every(feature => !feature.isAbstract),
                            isChecked: features.every(feature => !feature.isAbstract),
                            onClick: () => {
                                onSetFeatureAbstract({featureNames: features.map(feature => feature.name), value: false}).then(onClick);
                            }
                        }, makeDivider(), {
                            key: 'hidden',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.hidden'),
                            canCheck: true,
                            isChecked: features.every(feature => feature.isHidden),
                            onClick: () => {
                                onSetFeatureHidden({
                                    featureNames: features.map(feature => feature.name),
                                    value: !features.every(feature => feature.isHidden)
                                }).then(onClick);
                            }
                        }, makeDivider(), {
                            key: 'mandatory',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.mandatory'),
                            canCheck: true,
                            disabled: mandatoryDisabled || features.every(feature => feature.isMandatory),
                            isChecked: features.every(feature => feature.isMandatory),
                            onClick: () => {
                                onSetFeatureMandatory(
                                    {featureNames: features.map(feature => feature.name), value: true}).then(onClick);
                            }
                        }, {
                            key: 'optional',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.optional'),
                            canCheck: true,
                            disabled: mandatoryDisabled || features.every(feature => !feature.isMandatory),
                            isChecked: features.every(feature => !feature.isMandatory),
                            onClick: () => {
                                onSetFeatureMandatory(
                                    {featureNames: features.map(feature => feature.name), value: false}).then(onClick);
                            }
                        }, makeDivider(), {
                            key: 'and',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.and'),
                            canCheck: true,
                            disabled: groupDisabled || features.every(feature => feature.isAnd),
                            isChecked: features.every(feature => feature.isAnd),
                            onClick: () => {
                                onSetFeatureAnd(
                                    {featureNames: features.map(feature => feature.name)}).then(onClick);
                            }
                        }, {
                            key: 'or',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.or'),
                            canCheck: true,
                            disabled: groupDisabled || features.every(feature => feature.isOr),
                            isChecked: features.every(feature => feature.isOr),
                            onClick: () => {
                                onSetFeatureOr(
                                    {featureNames: features.map(feature => feature.name)}).then(onClick);
                            }
                        }, {
                            key: 'alternative',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.alternative'),
                            canCheck: true,
                            disabled: groupDisabled || features.every(feature => feature.isAlternative),
                            isChecked: features.every(feature => feature.isAlternative),
                            onClick: () => {
                                onSetFeatureAlternative(
                                    {featureNames: features.map(feature => feature.name)}).then(onClick);
                            }
                        }]
                    }
                });
            },
            selection: (isSelectMultipleFeatures: boolean, onSetSelectMultipleFeatures: OnSetSelectMultipleFeaturesFunction,
                selectedFeatureNames: string[], onDeselectAllFeatures: OnDeselectAllFeaturesFunction,
                onCollapseFeatures: OnCollapseFeaturesFunction, onExpandFeatures: OnExpandFeaturesFunction,
                onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction, onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
                onAddFeatureAbove: OnAddFeatureAboveFunction, onRemoveFeatures: OnRemoveFeaturesFunction,
                onRemoveFeaturesBelow: OnRemoveFeaturesBelowFunction, onSetFeatureAbstract: OnSetFeatureAbstractFunction,
                onSetFeatureHidden: OnSetFeatureHiddenFunction, onSetFeatureMandatory: OnSetFeatureMandatoryFunction,
                onSetFeatureAnd: OnSetFeatureAndFunction, onSetFeatureOr: OnSetFeatureOrFunction,
                onSetFeatureAlternative: OnSetFeatureAlternativeFunction, featureModel: FeatureModel) => ({
                key: 'selection',
                text: i18n.getFunction('commands.featureDiagram.feature.selection')(isSelectMultipleFeatures, selectedFeatureNames),
                onClick: () => onSetSelectMultipleFeatures({isSelectMultipleFeatures: !isSelectMultipleFeatures}), // TODO: tell the user he can choose features now
                subMenuProps: isSelectMultipleFeatures
                    ? {items: commands.featureDiagram.feature.selectionItems(selectedFeatureNames, onDeselectAllFeatures,
                        onCollapseFeatures, onExpandFeatures, onCollapseFeaturesBelow, onExpandFeaturesBelow, onAddFeatureAbove,
                        onRemoveFeatures, onRemoveFeaturesBelow, onSetFeatureAbstract, onSetFeatureHidden, onSetFeatureMandatory, onSetFeatureAnd, onSetFeatureOr,
                        onSetFeatureAlternative, featureModel)}
                    : undefined
            }),
            selectionItems: (selectedFeatureNames: string[], onDeselectAllFeatures: OnDeselectAllFeaturesFunction,
                onCollapseFeatures: OnCollapseFeaturesFunction, onExpandFeatures: OnExpandFeaturesFunction,
                onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction, onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
                onAddFeatureAbove: OnAddFeatureAboveFunction, onRemoveFeatures: OnRemoveFeaturesFunction,
                onRemoveFeaturesBelow: OnRemoveFeaturesBelowFunction, onSetFeatureAbstract: OnSetFeatureAbstractFunction,
                onSetFeatureHidden: OnSetFeatureHiddenFunction, onSetFeatureMandatory: OnSetFeatureMandatoryFunction,
                onSetFeatureAnd: OnSetFeatureAndFunction, onSetFeatureOr: OnSetFeatureOrFunction,
                onSetFeatureAlternative: OnSetFeatureAlternativeFunction, featureModel: FeatureModel) => [
                commands.featureDiagram.feature.newAbove(selectedFeatureNames, onAddFeatureAbove, onDeselectAllFeatures, featureModel),
                commands.featureDiagram.feature.removeMenu(featureModel.getFeatures(selectedFeatureNames), onRemoveFeatures, onRemoveFeaturesBelow, onDeselectAllFeatures),
                commands.featureDiagram.feature.collapseMenu(featureModel.getFeatures(selectedFeatureNames),
                    onCollapseFeatures, onExpandFeatures, onCollapseFeaturesBelow, onExpandFeaturesBelow, onDeselectAllFeatures),
                makeDivider(),
                commands.featureDiagram.feature.properties(featureModel.getFeatures(selectedFeatureNames),
                onSetFeatureAbstract, onSetFeatureHidden, onSetFeatureMandatory, onSetFeatureAnd, onSetFeatureOr,
                onSetFeatureAlternative, onDeselectAllFeatures)
            ],
            selectAll: (onSelectAll: OnSelectAllFeaturesFunction) => ({
                key: 'selectAll',
                text: i18n.t('commands.featureDiagram.feature.selectAll'),
                secondaryText: getShortcutText('featureDiagram.feature.selectAll'),
                onClick: onSelectAll
            }),
            deselectAll: (onDeselectAll: OnDeselectAllFeaturesFunction) => ({
                key: 'deselectAll',
                text: i18n.t('commands.featureDiagram.feature.deselectAll'),
                secondaryText: getShortcutText('featureDiagram.feature.deselectAll'),
                onClick: onDeselectAll
            }),
            collapseMenu: (features: Feature[], onCollapseFeatures: OnCollapseFeaturesFunction, onExpandFeatures: OnExpandFeaturesFunction,
                onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction, onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
                onClick: () => void, iconOnly = false) => {
                const isSingleFeature = features.length === 1,
                    isCollapsedSingleFeature = isSingleFeature && features[0].isCollapsed,
                    {disabled, action} = collapseCommand(features, onCollapseFeatures, onExpandFeatures, onClick);
                return {
                    key: 'collapseMenu',
                    text: !iconOnly ? i18n.getFunction('commands.featureDiagram.feature.collapseMenu.title')(isCollapsedSingleFeature) : undefined,
                    iconProps: {iconName: isCollapsedSingleFeature ? 'ExploreContentSingle' : 'CollapseContentSingle'},
                    iconOnly,
                    split: isSingleFeature,
                    disabled,
                    onClick: () => action(),
                    subMenuProps: {
                        items: [
                            ...((isSingleFeature ? [{
                                key: 'collapse',
                                text: i18n.getFunction('commands.featureDiagram.feature.collapseMenu.collapse')(features[0].isCollapsed),
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
            collapseAll: (onCollapseAllFeatures: OnCollapseAllFeaturesFunction) => ({
                key: 'collapseAll',
                text: i18n.t('commands.featureDiagram.feature.collapseAll'),
                secondaryText: getShortcutText('featureDiagram.feature.collapse'),
                iconProps: {iconName: 'CollapseContent'},
                onClick: onCollapseAllFeatures
            }),
            expandAll: (onExpandAllFeatures: OnExpandAllFeaturesFunction) => ({
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