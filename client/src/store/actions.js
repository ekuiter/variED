import messageActions from '../server/messageActions';
import {resetSettings, setSetting} from './settings';

export const actionTypes = {
    UI_SET_FEATURE_DIAGRAM_LAYOUT: 'UI_SET_FEATURE_DIAGRAM_LAYOUT',
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
        showPanel: (panel, panelProps) => ({type: actionTypes.UI_SHOW_PANEL, panel, panelProps}),
        hidePanel: () => ({type: actionTypes.UI_SHOW_PANEL, panel: null, panelProps: null}),
        showDialog: (dialog, dialogProps) => ({type: actionTypes.UI_SHOW_DIALOG, dialog, dialogProps}),
        hideDialog: () => ({type: actionTypes.UI_SHOW_DIALOG, dialog: null, dialogProps: null}),
    }
};

export default actions;