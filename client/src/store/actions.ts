/**
 * Actions define an interface to update the Redux store.
 * They are plain objects describing a state change.
 */

import messageActions from '../server/messageActions';
import {createActions} from 'redux-actions';

const actions = createActions({
    SETTINGS: {
        SET: (path: string, value: any) => ({path, value}),
        RESET: () => {}
    },
    UI: {
        FEATURE_DIAGRAM: {
            SET_LAYOUT: (layout: string) => ({layout}), // TODO
            FIT_TO_SCREEN: () => {},
            FEATURE: {
                SET_SELECT_MULTIPLE: (isSelectMultipleFeatures: boolean) => ({isSelectMultipleFeatures}),
                SELECT: (featureName: string) => ({featureName}),
                DESELECT: (featureName: string) => ({featureName}),
                SELECT_ALL: () => {},
                DESELECT_ALL: () => {},

                COLLAPSE: (featureNames: string[]) => ({featureNames}),
                EXPAND: (featureNames: string[]) => ({featureNames}),
                COLLAPSE_ALL: () => {},
                EXPAND_ALL: () => {},
                COLLAPSE_BELOW: (featureNames: string[]) => ({featureNames}),
                EXPAND_BELOW: (featureNames: string[]) => ({featureNames})
            }
        },
        OVERLAY: {
            SHOW: (overlay: string, overlayProps: object, {selectOneFeature}: {selectOneFeature?: string} = {}) => // TODO: more accurate types
                ({overlay, overlayProps, selectOneFeature}),
            HIDE: (overlay: string) => ({overlay}),
        }
    }
});
actions.server = messageActions;

export default actions;