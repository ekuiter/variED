import {defaultSettings} from './store/settings';

const constants = {
    panels: {
        aboutPanel: {
            githubUri: 'https://github.com/ekuiter/variED',
            licenseUri: 'https://github.com/ekuiter/variED/blob/master/LICENSE.txt'
        }
    },
    store: {
        initialState: {
            server: {
                endpoints: []
            },
            settings: defaultSettings,
            ui: {
                featureDiagramLayout: 'verticalTree',
                isSelectMultipleFeatures: false,
                selectedFeatures: [],
                panel: null,
                panelProps: null,
                dialog: null,
                dialogProps: null
            }
        }
    },
    server: {
        webSocket: process.env.REACT_APP_WEBSOCKET || `ws://${window.location.host}/websocket`, // WebSocket URI to connect to
        isMessageType(type) {
            return Object.values(this.messageTypes).includes(type);
        },
        messageTypes: { // message type enumeration used by the server
            ERROR: 'ERROR',
            ENDPOINT_SUBSCRIBE: 'ENDPOINT_SUBSCRIBE',
            ENDPOINT_UNSUBSCRIBE: 'ENDPOINT_UNSUBSCRIBE',
            FEATURE_MODEL: 'FEATURE_MODEL',
            FEATURE_MODEL_PATCH: 'FEATURE_MODEL_PATCH',
            UNDO: 'UNDO',
            REDO: 'REDO',
            CONSTRAINT_MOVE: 'CONSTRAINT_MOVE',
            CONSTRAINT_MODIFY: 'CONSTRAINT_MODIFY',
            CONSTRAINT_DELETE: 'CONSTRAINT_DELETE',
            CONSTRAINT_ADD: 'CONSTRAINT_ADD',
            CONSTRAINT_SELECTED: 'CONSTRAINT_SELECTED',
            FEATURE_MODIFY: 'FEATURE_MODIFY',
            FEATURE_DELETE: 'FEATURE_DELETE',
            FEATURE_ADD_ABOVE: 'FEATURE_ADD_ABOVE',
            FEATURE_ADD: 'FEATURE_ADD',
            FEATURE_NAME_CHANGED: 'FEATURE_NAME_CHANGED',
            ALL_FEATURES_CHANGED_NAME_TYPE: 'ALL_FEATURES_CHANGED_NAME_TYPE',
            COLOR_CHANGED: 'COLOR_CHANGED',
            HIDDEN_CHANGED: 'HIDDEN_CHANGED',
            COLLAPSED_CHANGED: 'COLLAPSED_CHANGED',
            COLLAPSED_ALL_CHANGED: 'COLLAPSED_ALL_CHANGED',
            LOCATION_CHANGED: 'LOCATION_CHANGED',
            ATTRIBUTE_CHANGED: 'ATTRIBUTE_CHANGED',
            GROUP_TYPE_CHANGED: 'GROUP_TYPE_CHANGED',
            PARENT_CHANGED: 'PARENT_CHANGED',
            MANDATORY_CHANGED: 'MANDATORY_CHANGED',
            STRUCTURE_CHANGED: 'STRUCTURE_CHANGED',
            LEGEND_LAYOUT_CHANGED: 'LEGEND_LAYOUT_CHANGED',
            MODEL_LAYOUT_CHANGED: 'MODEL_LAYOUT_CHANGED',
            MODEL_DATA_CHANGED: 'MODEL_DATA_CHANGED',
            MODEL_DATA_SAVED: 'MODEL_DATA_SAVED',
            MODEL_DATA_LOADED: 'MODEL_DATA_LOADED',
            MODEL_DATA_OVERRIDDEN: 'MODEL_DATA_OVERRIDDEN',
            REDRAW_DIAGRAM: 'REDRAW_DIAGRAM',
            REFRESH_ACTIONS: 'REFRESH_ACTIONS',
            CHILDREN_CHANGED: 'CHILDREN_CHANGED',
            DEPENDENCY_CALCULATED: 'DEPENDENCY_CALCULATED',
            ACTIVE_EXPLANATION_CHANGED: 'ACTIVE_EXPLANATION_CHANGED',
            FEATURE_ATTRIBUTE_CHANGED: 'FEATURE_ATTRIBUTE_CHANGED',
            ACTIVE_REASON_CHANGED: 'ACTIVE_REASON_CHANGED',
            DEFAULT: 'DEFAULT'
        },
        featureModel: {
            serialization: { // tags and attributes used in serialized feature models
                STRUCT: 'struct',
                CONSTRAINTS: 'constraints',
                PROPERTIES: 'properties',
                CALCULATIONS: 'calculations',
                COMMENTS: 'comments',
                FEATURE_ORDER: 'featureOrder',
                TYPE: 'type',
                FEATURE: 'feature',
                OR: 'or',
                ALT: 'alt',
                AND: 'and',
                NAME: 'name',
                DESCRIPTION: 'description',
                MANDATORY: 'mandatory',
                ABSTRACT: 'abstract',
                HIDDEN: 'hidden'
            }
        }
    },
    helpers: {
        withDimensions: {
            throttleResize: 10 // limits number of window resize events to one per ... ms (avoids unnecessary rendering)
        },
        fontComboBox: {
            suggestedFonts: [
                'Arial', 'Calibri', 'Candara', 'Century Gothic', 'Courier New', 'Futura', 'Garamond', 'Geneva',
                'Georgia', 'Helvetica', 'Helvetica Neue', 'Lucida Grande', 'Palatino', 'Segoe UI', 'Tahoma',
                'Times New Roman', 'Trebuchet MS', 'Verdana'
            ]
        }
    }
};

export default constants;