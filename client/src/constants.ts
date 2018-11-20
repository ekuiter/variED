/**
 * Constants which can not be adjusted at runtime.
 * As they may not be updated at runtime, we can just treat these constants as global.
 */

const constants = {
    featureDiagram: {
        fitToScreen: {
            minWidth: 500,
            minHeight: 500,
            maxCollapsibleNodes: (nodes: any[]) => nodes.length > 100 ? nodes.length / 10 : 1
        }
    },
    views: {
        splitMiddle: 0.6
    },
    overlays: {
        aboutPanel: {
            githubUri: 'https://github.com/ekuiter/variED',
            licenseUri: 'https://github.com/ekuiter/variED/blob/master/LICENSE.txt'
        }
    },
    server: {
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
        }
    },
    helpers: {
        withDimensions: {
            throttleResize: 50 // limits number of window resize events to one per ... ms (avoids unnecessary rendering)
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