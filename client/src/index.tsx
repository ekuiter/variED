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
import reducer, {Store} from './store/reducer';
import {initializeIcons} from 'office-ui-fabric-react/lib/Icons';
import actions from './store/actions';
import {LogLevel, setLogLevel} from './helpers/logger';
import Kernel from './modeling/Kernel';

if (window.location.protocol !== 'http:')
    window.location.protocol = 'http:'; // TODO: hack until we support WSS

initializeIcons('/assets/');

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store: Store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)));

// for debugging purposes
declare var window: any;
window.app = {
    setLogLevel,
    LogLevel, // parameter for setLogLevel
    actions, // can be dispatched with the store (for debugging)
    store, // used by message delay simulation
    runKernel: (fn: (kernel: Kernel) => any) => // for debugging
        Kernel.run(store.getState(), store.getState().currentArtifactPath, fn)
};

ReactDOM.render((
    <Provider store={store}>
        <AppContainer/>
    </Provider>
), document.getElementById('root'));

store.dispatch<any>(actions.server.joinRequest({artifactPath: {project: 'FeatureModeling', artifact: 'CTV'}}));