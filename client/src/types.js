import PropTypes from 'prop-types';
import FeatureModel from './server/FeatureModel';

export const
    layoutTypes = {
        verticalTree: 'verticalTree',
        horizontalTree: 'horizontalTree'
    },
    LayoutType = PropTypes.oneOf(Object.values(layoutTypes)),

    SettingsType = PropTypes.object,

    FeatureModelType = PropTypes.instanceOf(FeatureModel),

    overlayTypes = {
        settingsPanel: 'settingsPanel',
        aboutPanel: 'aboutPanel',
        featurePanel: 'featurePanel',
        featureRenameDialog: 'featureRenameDialog',
        featureSetDescriptionDialog: 'featureSetDescriptionDialog',
        featureCallout: 'featureCallout',
        featureContextualMenu: 'featureContextualMenu',
        isShownAtSelectedFeature: type => type === 'featureCallout' || type === 'featureContextualMenu'
    },
    OverlayType = PropTypes.oneOf(Object.values(overlayTypes));