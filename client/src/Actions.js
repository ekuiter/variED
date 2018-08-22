import messageActions from './server/messageActions';
import {resetSettings, setSetting} from './settings';

export const actionTypes = {
    UI_SET_FEATURE_DIAGRAM_LAYOUT: 'UI_SET_FEATURE_DIAGRAM_LAYOUT'
};

const Actions = {
    server: messageActions,
    settings: {
        set: setSetting,
        reset: resetSettings
    },
    ui: {
        setFeatureDiagramLayout: featureDiagramLayout =>
            ({type: actionTypes.UI_SET_FEATURE_DIAGRAM_LAYOUT, featureDiagramLayout})
    }
};

export default Actions;