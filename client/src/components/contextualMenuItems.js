import i18n from '../i18n';
import actions from '../store/actions';
import {selectMultipleFeaturesContextualMenuItems} from './overlays/FeatureContextualMenu';
import {layoutTypes, overlayTypes} from '../types';
import {ContextualMenuItemType} from '../../node_modules/office-ui-fabric-react/lib/ContextualMenu';
import {getShortcutText} from '../shortcuts';

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
        export: () => ({
            key: 'export',
            text: i18n.t('featureDiagram.commands.export'),
            iconProps: {iconName: 'Share'},
            subMenuProps: {
                items: [{
                    key: 'svg',
                    text: i18n.t('featureDiagram.commands.svg'),
                    onClick: () => console.warn('not implemented yet')
                }]
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
            remove: (feature, onClick) => ({
                key: 'remove',
                text: i18n.t('featureDiagram.commands.feature.remove'),
                iconProps: {iconName: 'Remove'},
                iconOnly: true,
                disabled: feature.isRoot && (!feature.hasChildren || feature.node.children.length > 1),
                onClick: () => actions.server.feature.remove(feature.name).then(onClick)
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
            collapseExpand: (feature, onCollapseFeature, onExpandFeature, onClick) => ({
                key: 'collapseExpand',
                text: i18n.t('featureDiagram.commands.feature.collapseExpand')(feature.isCollapsed),
                iconProps: {iconName: feature.isCollapsed ? 'ExploreContent' : 'CollapseContent'},
                iconOnly: true,
                disabled: !feature.hasActualChildren,
                onClick: () => {
                    if (feature.isCollapsed)
                        onExpandFeature(feature.name);
                    else
                        onCollapseFeature(feature.name);
                    onClick();
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
            }
        },
        features: {
            selectAll: onSelectAll => ({
                key: 'selectAll',
                text: i18n.t('featureDiagram.commands.features.selectAll'),
                secondaryText: getShortcutText('featureDiagram.features.selectAll'),
                onClick: onSelectAll
            }),
            deselectAll: onDeselectAll => ({
                key: 'deselectAll',
                text: i18n.t('featureDiagram.commands.features.deselectAll'),
                secondaryText: getShortcutText('featureDiagram.features.deselectAll'),
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
            },
            collapseAll:  onCollapseAllFeatures => ({
                key: 'collapseAll',
                text: i18n.t('featureDiagram.commands.features.collapseAll'),
                secondaryText: getShortcutText('featureDiagram.features.collapseAll'),
                iconProps: {iconName: 'CollapseContent'},
                onClick: onCollapseAllFeatures
            }),
            expandAll:  onExpandAllFeatures => ({
                key: 'expandAll',
                text: i18n.t('featureDiagram.commands.features.expandAll'),
                secondaryText: getShortcutText('featureDiagram.features.expandAll'),
                iconProps: {iconName: 'ExploreContent'},
                onClick: onExpandAllFeatures
            })
        }
    }
};

export default contextualMenuItems;