/**
 * Constants which can not be adjusted at runtime.
 * As they may not be updated at runtime, we can just treat these constants as global.
 */

const constants = {
    featureDiagram: {
        minimumInitialZoom: 0.6,
        fitToScreen: {
            minWidth: 500,
            minHeight: 500,
            maxCollapsibleNodes: (nodes: any[]) => nodes.length > 100 ? nodes.length / 10 : 1
        },
        conflictView: {
            transition: 1000,
            transitionNeutral: 600
        }
    },
    constraint: {
        featureStyle: {
            color: '#050'
        }
    },
    overlays: {
        aboutPanel: {
            githubUri: 'https://github.com/ekuiter/variED',
            feedbackUri: 'https://goo.gl/forms/uUJmj68FYir9vEI13',
            licenseUri: 'https://github.com/ekuiter/variED/blob/master/LICENSE.txt',
            researchGroupUri: 'http://www.dbse.ovgu.de/',
            mailto: 'mailto:kuiter@ovgu.de'
        }
    },
    server: {
        // WebSocket URI to connect to
        webSocket: (siteID = 'initialize') => `ws://${process.env.REACT_APP_SERVER || window.location.host}/websocket/${siteID}`
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