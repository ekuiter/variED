import i18n from '../i18n';
import actions from '../store/actions';

const contextualMenuItems = {
    settings: onShowPanel => ({
        key: 'settings',
        text: i18n.t('panels.settingsPanel.title'),
        iconOnly: true,
        iconProps: {iconName: 'Settings'},
        onClick: () => onShowPanel('settings')
    }),
    about: onShowPanel => ({
        key: 'about',
        text: i18n.t('panels.aboutPanel.title'),
        iconOnly: true,
        iconProps: {iconName: 'Info'},
        onClick: () => onShowPanel('about')
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
        feature: {
            new: (featureName, onClick) => ({
                key: 'new',
                text: i18n.t('featureDiagram.commands.feature.new'),
                iconProps: {iconName: 'Add'},
                subMenuProps: {
                    items: [{
                        key: 'featureBelow',
                        text: i18n.t('featureDiagram.commands.feature.featureBelow'),
                        onClick: () => actions.server.featureAdd(featureName).then(onClick)
                    }, {
                        key: 'featureAbove',
                        text: i18n.t('featureDiagram.commands.feature.featureAbove')
                    }]
                }
            }),
            remove: (featureName, onClick) => ({
                key: 'remove',
                text: i18n.t('featureDiagram.commands.feature.remove'),
                iconProps: {iconName: 'Remove'},
                onClick: () => actions.server.featureDelete(featureName).then(onClick)
            }),
            details: (featureName, onShowPanel) => ({
                key: 'details',
                text: i18n.t('featureDiagram.commands.feature.details'),
                iconProps: {iconName: 'Info'},
                iconOnly: true,
                onClick: () => onShowPanel('feature', {featureName})
            }),
            rename: (featureName, onShowDialog) => ({
                key: 'rename',
                text: i18n.t('featureDiagram.commands.feature.rename'),
                iconProps: {iconName: 'Rename'},
                onClick: () => onShowDialog('featureRename', {featureName})
            })
        }
    }
};

export default contextualMenuItems;