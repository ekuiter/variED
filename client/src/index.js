import React from 'react';
import ReactDOM from 'react-dom';
import AppContainer from './AppContainer';
import 'normalize.css';
import './index.css';
import Constants from './Constants';
import FontFaceObserver from 'fontfaceobserver';
import 'promise-polyfill/src/polyfill';
import 'whatwg-fetch';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import reducers from './reducers';

if (window.location.protocol !== "http:")
    window.location.protocol = "http:"; // TODO: hack until we support WSS

const store = createStore(
    reducers,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

new FontFaceObserver(Constants.font.family).load(null, Constants.font.loadTimeout)
    .then(render)
    .catch(() => {
        Constants.font.family = Constants.font.familyFallback;
        Constants.font.textMeasure = Constants.font.textMeasureFallback;
        render();
    });

function render() {
    ReactDOM.render((
        <Provider store={store}>
            <AppContainer/>
        </Provider>
    ), document.getElementById('root'));
}