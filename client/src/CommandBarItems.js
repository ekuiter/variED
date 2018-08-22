import i18n from './i18n';
import Actions from './Actions';

const CommandBarItems = {
    settings: onClick => ({
        key: 'settings',
        text: i18n.t('settingsPanel.title'),
        iconOnly: true,
        iconProps: {iconName: 'Settings'},
        onClick
    }),
    about: onClick => ({
        key: 'about',
        text: i18n.t('aboutPanel.title'),
        iconOnly: true,
        iconProps: {iconName: 'Info'},
        onClick
    }),
    featureDiagram: {
        undo: onClick => ({
            key: 'undo',
            text: i18n.t('featureDiagram.commands.undo'),
            iconProps: {iconName: 'Undo'},
            onClick: () => Actions.server.undo().then(onClick)
        }),
        redo: onClick => ({
            key: 'redo',
            text: i18n.t('featureDiagram.commands.redo'),
            iconProps: {iconName: 'Redo'},
            onClick: () => Actions.server.redo().then(onClick)
        }),
        setLayout: (featureDiagramLayout, dispatch) => ({
            key: 'setLayout',
            text: i18n.t('featureDiagram.commands.setLayout'),
            subMenuProps: {
                items: [{
                    key: 'verticalTree',
                    text: i18n.t('featureDiagram.commands.verticalTree'),
                    canCheck: true,
                    isChecked: featureDiagramLayout === 'verticalTree',
                    onClick: () => dispatch(Actions.ui.setFeatureDiagramLayout('verticalTree'))
                }, {
                    key: 'horizontalTree',
                    text: i18n.t('featureDiagram.commands.horizontalTree'),
                    canCheck: true,
                    isChecked: featureDiagramLayout === 'horizontalTree',
                    onClick: () => dispatch(Actions.ui.setFeatureDiagramLayout('horizontalTree'))
                }]
            }
        }),
        new: (feature, onClick) => ({
            key: 'new',
            text: i18n.t('featureDiagram.commands.new'),
            iconProps: {iconName: 'Add'},
            subMenuProps: {
                items: [{
                    key: 'featureBelow',
                    text: i18n.t('featureDiagram.commands.featureBelow'),
                    onClick: () => Actions.server.featureAdd(feature.name).then(onClick)
                }, {
                    key: 'featureAbove',
                    text: i18n.t('featureDiagram.commands.featureAbove')
                }]
            }
        }),
        remove: (feature, onClick) => ({
            key: 'remove',
            text: i18n.t('featureDiagram.commands.remove'),
            iconProps: {iconName: 'Remove'},
            onClick: () => Actions.server.featureDelete(feature.name).then(onClick)
        }),
        rename: feature => ({
            key: 'rename',
            text: i18n.t('featureDiagram.commands.rename'),
            iconProps: {iconName: 'Rename'}
        }),
        changeDescription: feature => ({
            key: 'changeDescription',
            text: i18n.t('featureDiagram.commands.changeDescription'),
            iconProps: {iconName: 'Edit'}
        })
    }
};

export default CommandBarItems;