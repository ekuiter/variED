import messageActions from '../server/messageActions';
import {createActions} from 'redux-actions';

const actions = createActions({
    SETTINGS: {
        SET: (path, value) => ({path, value}),
        RESET: () => {}
    },
    UI: {
        SET_FEATURE_DIAGRAM_LAYOUT: featureDiagramLayout =>
            ({featureDiagramLayout}),
        FIT_TO_SCREEN: () => {},
        FEATURE: {
            SELECT: featureName => ({featureName}),
            DESELECT: featureName => ({featureName}),
            COLLAPSE: featureName => ({featureName}),
            EXPAND: featureName => ({featureName}),
        },
        FEATURES: {
            SET_SELECT_MULTIPLE: isSelectMultipleFeatures =>
                ({isSelectMultipleFeatures}),
            SELECT_ALL: () => {},
            DESELECT_ALL: () => {},
            COLLAPSE_ALL: () => {},
            EXPAND_ALL: () => {},
            COLLAPSE_BELOW: featureName => ({featureName}),
            EXPAND_BELOW: featureName => ({featureName})
        },
        OVERLAY: {
            SHOW: (overlay, overlayProps, {selectOneFeature} = {}) =>
                ({overlay, overlayProps, selectOneFeature}),
            HIDE: (overlay) => ({overlay}),
        }
    }
});
actions.server = messageActions;

export default actions;