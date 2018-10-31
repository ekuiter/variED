/**
 * Main application entry point.
 * This initializes Redux and the React app container.
 */

import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom';
import AppContainer from './components/AppContainer';
import 'normalize.css';
import './stylesheets/index.css';
import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import {Provider} from 'react-redux';
import reducer from './store/reducer';
import {initializeIcons} from 'office-ui-fabric-react/lib/Icons';
import actions from './store/actions';
import {LogLevel, setLogLevel} from './helpers/logger';
import {Test} from './common/Test';

if (window.location.protocol !== 'http:')
    window.location.protocol = 'http:'; // TODO: hack until we support WSS

initializeIcons('/assets/');

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)));

declare var window: any;
window.app = {setLogLevel, LogLevel, actions, store}; // for debugging purposes

ReactDOM.render((
    <Provider store={store}>
        <AppContainer/>
    </Provider>
), document.getElementById('root'));

store.dispatch<any>(actions.server.join({artifactPath: {project: 'FeatureModeling', artifact: 'CTV'}}));

Test.doSomething();