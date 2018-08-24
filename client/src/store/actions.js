import messageActions from '../server/messageActions';
import {resetSettings, setSetting} from './settings';

export const actionTypes = {
    UI_SET_FEATURE_DIAGRAM_LAYOUT: 'UI_SET_FEATURE_DIAGRAM_LAYOUT',
    UI_SET_SELECT_MULTIPLE_FEATURES: 'UI_SET_SELECT_MULTIPLE_FEATURES',
    UI_SELECT_FEATURE: 'UI_SELECT_FEATURE',
    UI_SELECT_ONE_FEATURE: 'UI_SELECT_ONE_FEATURE',
    UI_DESELECT_FEATURE: 'UI_DESELECT_FEATURE',
    UI_DESELECT_ALL_FEATURES: 'UI_DESELECT_ALL_FEATURES',
    UI_SHOW_PANEL: 'UI_SHOW_PANEL',
    UI_SHOW_DIALOG: 'UI_SHOW_DIALOG'
};

const actions = {
    server: messageActions,
    settings: {
        set: setSetting,
        reset: resetSettings
    },
    ui: {
        setFeatureDiagramLayout: featureDiagramLayout =>
            ({type: actionTypes.UI_SET_FEATURE_DIAGRAM_LAYOUT, featureDiagramLayout}),
        setSelectMultipleFeatures: isSelectMultipleFeatures =>
            ({type: actionTypes.UI_SET_SELECT_MULTIPLE_FEATURES, isSelectMultipleFeatures}),
        selectFeature: featureName => ({type: actionTypes.UI_SELECT_FEATURE, featureName}),
        selectOneFeature: featureName => ({type: actionTypes.UI_SELECT_ONE_FEATURE, featureName}),
        deselectFeature: featureName => ({type: actionTypes.UI_DESELECT_FEATURE, featureName}),
        deselectAllFeatures: () => ({type: actionTypes.UI_DESELECT_ALL_FEATURES}),
        showPanel: (panel, panelProps) => ({type: actionTypes.UI_SHOW_PANEL, panel, panelProps}),
        hidePanel: () => ({type: actionTypes.UI_SHOW_PANEL, panel: null, panelProps: null}),
        showDialog: (dialog, dialogProps) => ({type: actionTypes.UI_SHOW_DIALOG, dialog, dialogProps}),
        hideDialog: () => ({type: actionTypes.UI_SHOW_DIALOG, dialog: null, dialogProps: null}),
    }
};

export default actions;