import PropTypes from 'prop-types';

export const
    layoutTypes = {
        verticalTree: 'verticalTree',
        horizontalTree: 'horizontalTree'
    },
    LayoutType = PropTypes.oneOf(Object.values(layoutTypes)),

    SettingsType = PropTypes.object,

    overlayTypes = {
        settingsPanel: 'settingsPanel',
        aboutPanel: 'aboutPanel',
        featurePanel: 'featurePanel',
        featureRenameDialog: 'featureRenameDialog',
        featureSetDescriptionDialog: 'featureSetDescriptionDialog',
        exportSvgDialog: 'exportSvg',
        featureCallout: 'featureCallout',
        featureContextualMenu: 'featureContextualMenu',
        isShownAtSelectedFeature: type => type === 'featureCallout' || type === 'featureContextualMenu'
    },
    OverlayType = PropTypes.oneOf(Object.values(overlayTypes));