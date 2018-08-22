import messageActions from './server/messageActions';
import {setSetting} from './settings';

export const actionTypes = {
    UI_SET_FEATURE_DIAGRAM_LAYOUT: 'UI_SET_FEATURE_DIAGRAM_LAYOUT'
};

const Actions = {
    server: messageActions,
    settings: {
        set: setSetting
    },
    ui: {
        setFeatureDiagramLayout: featureDiagramLayout =>
            ({type: actionTypes.UI_SET_FEATURE_DIAGRAM_LAYOUT, featureDiagramLayout})
    }
};

export default Actions;