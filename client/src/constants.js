import {defaultSettings} from './store/settings';
import {layoutTypes} from './types';

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
                users: []
            },
            settings: defaultSettings,
            ui: {
                featureDiagramLayout: layoutTypes.verticalTree,
                isSelectMultipleFeatures: false,
                selectedFeatureNames: [],
                overlay: null,
                overlayProps: null
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
            USER_SUBSCRIBE: 'USER_SUBSCRIBE',
            USER_UNSUBSCRIBE: 'USER_UNSUBSCRIBE',
            FEATURE_MODEL: 'FEATURE_MODEL',
            FEATURE_MODEL_PATCH: 'FEATURE_MODEL_PATCH',
            UNDO: 'UNDO',
            REDO: 'REDO',
            FEATURE_ADD_BELOW: 'FEATURE_ADD_BELOW',
            FEATURE_ADD_ABOVE: 'FEATURE_ADD_ABOVE',
            FEATURE_REMOVE: 'FEATURE_REMOVE',
            FEATURE_RENAME: 'FEATURE_RENAME',
            FEATURE_SET_DESCRIPTION: 'FEATURE_SET_DESCRIPTION',
            FEATURE_SET_PROPERTY: 'FEATURE_SET_PROPERTY'
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