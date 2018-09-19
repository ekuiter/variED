import {defaultSettings} from './store/settings';
import {layoutTypes} from './types';

const constants = {
    featureDiagram: {
        fitToScreen: {
            minWidth: 500,
            minHeight: 500,
            maxCollapsibleNodes: (nodes: any[]) => nodes.length > 100 ? nodes.length / 10 : 1
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