/**
 * Actions define an interface to update the Redux store.
 * They are plain objects describing a state change.
 */

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

                COLLAPSE: featureNames => ({featureNames}),
                EXPAND: featureNames => ({featureNames}),
                COLLAPSE_ALL: () => {},
                EXPAND_ALL: () => {},
                COLLAPSE_BELOW: featureNames => ({featureNames}),
                EXPAND_BELOW: featureNames => ({featureNames})
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