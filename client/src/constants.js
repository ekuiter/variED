import {defaultSettings} from './store/settings';
import {layoutTypes} from './types';

const constants = {
    featureDiagram: {
        fitToScreen: {
            minWidth: 500,
            minHeight: 500,
            maxCollapsibleNodes: nodes => nodes.length > 100 ? nodes.length / 10 : 1
        }
    },
    overlays: {
        aboutPanel: {
            githubUri: 'https://github.com/ekuiter/variED',
            licenseUri: 'https://github.com/ekuiter/variED/blob/master/LICENSE.txt'
        }
    },
    store: {
        initialState: {
            server: {
                users: [],
                featureModel: null
            },
            settings: defaultSettings,
            ui: {
                featureDiagram: {
                    layout: layoutTypes.verticalTree
                },
                isSelectMultipleFeatures: false,
                selectedFeatureNames: [],
                collapsedFeatureNames: [],
                overlay: null,
                overlayProps: null
            }
        }
    },
    server: {
        // eslint-disable-next-line no-undef
        webSocket: process.env.REACT_APP_WEBSOCKET || `ws://${window.location.host}/websocket`, // WebSocket URI to connect to
        isMessageType(type) {
            return Object.values(this.messageTypes).includes(type);
        },
        messageTypes: { // message type enumeration used by the server
            ERROR: 'ERROR',
            JOIN: 'JOIN',
            LEAVE: 'LEAVE',
            UNDO: 'UNDO',
            REDO: 'REDO',
            MULTIPLE_MESSAGES: 'MULTIPLE_MESSAGES',
            FEATURE_DIAGRAM_FEATURE_MODEL: 'FEATURE_DIAGRAM_FEATURE_MODEL',
            FEATURE_DIAGRAM_FEATURE_ADD_BELOW: 'FEATURE_DIAGRAM_FEATURE_ADD_BELOW',
            FEATURE_DIAGRAM_FEATURE_ADD_ABOVE: 'FEATURE_DIAGRAM_FEATURE_ADD_ABOVE',
            FEATURE_DIAGRAM_FEATURE_REMOVE: 'FEATURE_DIAGRAM_FEATURE_REMOVE',
            FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW: 'FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW',
            FEATURE_DIAGRAM_FEATURE_RENAME: 'FEATURE_DIAGRAM_FEATURE_RENAME',
            FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION: 'FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION',
            FEATURE_DIAGRAM_FEATURE_SET_PROPERTY: 'FEATURE_DIAGRAM_FEATURE_SET_PROPERTY'
        },
        propertyTypes: {
            abstract: 'abstract',
            hidden: 'hidden',
            mandatory: 'mandatory',
            group: 'group'
        },
        groupValueTypes: {
            and: 'and',
            or: 'or',
            alternative: 'alternative'
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