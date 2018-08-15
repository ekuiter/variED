import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'normalize.css';
import './index.css';
import Constants from './Constants';
import FontFaceObserver from 'fontfaceobserver';
import 'promise-polyfill/src/polyfill';
import 'whatwg-fetch';

if (window.location.protocol !== "http:")
    window.location.protocol = "http:"; // TODO: hack until we support WSS

new FontFaceObserver(Constants.font.family).load(null, Constants.font.loadTimeout)
    .then(render)
    .catch(() => {
        Constants.font.family = Constants.font.familyFallback;
        Constants.font.textMeasure = Constants.font.textMeasureFallback;
        render();
    });

function render() {
    ReactDOM.render(<App/>, document.getElementById('root'));
}