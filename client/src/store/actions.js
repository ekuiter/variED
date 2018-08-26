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
        SET_SELECT_MULTIPLE_FEATURES: isSelectMultipleFeatures =>
            ({isSelectMultipleFeatures}),
        SELECT_FEATURE: featureName => ({featureName}),
        DESELECT_FEATURE: featureName => ({featureName}),
        SELECT_ALL_FEATURES: () => {},
        DESELECT_ALL_FEATURES: () => {},
        SHOW_OVERLAY: (overlay, overlayProps, {selectFeature} = {}) => ({overlay, overlayProps, selectFeature}),
        HIDE_OVERLAY: (overlay) => ({overlay})
    }
});
actions.server = messageActions;

export default actions;