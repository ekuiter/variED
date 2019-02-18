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
import {persistStore, persistReducer, createTransform} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import reducer, {Store} from './store/reducer';
import {initializeIcons} from 'office-ui-fabric-react/lib/Icons';
import actions from './store/actions';
import {LogLevel, setLogLevel} from './helpers/logger';
import Kernel from './modeling/Kernel';
import {initialState} from './store/types';

if (window.location.protocol !== 'http:')
    window.location.protocol = 'http:'; // TODO: hack until we support WSS

initializeIcons('/assets/');

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const substateTransform = createTransform(
    // ignore the state keys whitelisted below
    // (redux-persist white/blacklist does not work for some reason)
    (inboundState, key) => initialState[key],
    (outboundState, key) => outboundState,
    {'whitelist': ['overlay', 'overlayProps', 'collaborativeSessions', 'currentArtifactPath']}
);
const persistedReducer = persistReducer({
    key: 'root',
    storage,
    transforms: [substateTransform]
}, reducer);
const store: Store = createStore(
    persistedReducer,
    composeEnhancers(applyMiddleware(thunk)));
const persistor = persistStore(store);

// for debugging purposes
declare var window: any;
window.app = {
    setLogLevel,
    LogLevel, // parameter for setLogLevel
    actions, // can be dispatched with the store (for debugging)
    store, // used by message delay/offline simulation
    persistor, // used to clear local storage
    runKernel: (fn: (kernel: Kernel) => any) => // for debugging
        Kernel.run(store.getState(), store.getState().currentArtifactPath, fn)
};

ReactDOM.render((
    <Provider store={store}>
        <PersistGate persistor={persistor}>
            <AppContainer/>
        </PersistGate>
    </Provider>
), document.getElementById('root'));

if (store.getState().settings.developer.debug)
    setLogLevel(LogLevel.info);

store.dispatch<any>(actions.server.joinRequest({artifactPath: {project: 'FeatureModeling', artifact: 'CTV'}}));