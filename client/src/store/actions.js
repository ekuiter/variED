import messageActions from '../server/messageActions';
import {createActions} from 'redux-actions';

const actions = createActions({
    SETTINGS: {
        SET: (path, value) => ({path, value}),
        RESET: () => {}
    },
    UI: {
        FEATURE_DIAGRAM: {
            SET_LAYOUT: layout => ({layout}),
            FIT_TO_SCREEN: () => {},
            FEATURE: {
                SET_SELECT_MULTIPLE: isSelectMultipleFeatures => ({isSelectMultipleFeatures}),
                SELECT: featureName => ({featureName}),
                DESELECT: featureName => ({featureName}),
                SELECT_ALL: () => {},
                DESELECT_ALL: () => {},

                COLLAPSE: featureName => ({featureName}),
                EXPAND: featureName => ({featureName}),
                COLLAPSE_ALL: () => {},
                EXPAND_ALL: () => {},
                COLLAPSE_BELOW: featureName => ({featureName}),
                EXPAND_BELOW: featureName => ({featureName})
            }
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