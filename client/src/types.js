import PropTypes from 'prop-types';

export const
    layoutTypes = {
        verticalTree: 'verticalTree',
        horizontalTree: 'horizontalTree'
    },
    LayoutType = PropTypes.oneOf(Object.values(layoutTypes)),

    formatTypes = {
        svg: 'svg',
        png: 'png',
        jpg: 'jpg',
        pdf: 'pdf'
    },
    FormatType = PropTypes.oneOf(Object.values(formatTypes)),

    SettingsType = PropTypes.object,

    overlayTypes = {
        settingsPanel: 'settingsPanel',
        aboutPanel: 'aboutPanel',
        featurePanel: 'featurePanel',
        featureRenameDialog: 'featureRenameDialog',
        featureSetDescriptionDialog: 'featureSetDescriptionDialog',
        exportDialog: 'export',
        featureCallout: 'featureCallout',
        featureContextualMenu: 'featureContextualMenu',
        isFloatingFeature: type => type === 'featureCallout' || type === 'featureContextualMenu'
    },
    OverlayType = PropTypes.oneOf(Object.values(overlayTypes));