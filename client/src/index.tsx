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
import {numberofUnflushedMessages} from './server/messageQueue';
import i18n from './i18n';
import uuidv4 from 'uuid/v4';
import {defaultSettings} from './store/settings';

declare var window: any;

if (!window.name)
    window.name = uuidv4();

(() => {
    const lastActive = localStorage.getItem('lastActive');
    const [lastActiveWindow, lastActiveTimestamp]: [string, number] =
        lastActive ? JSON.parse(lastActive) : [undefined, undefined];

    if (lastActiveWindow && lastActiveTimestamp &&
        (+new Date) - lastActiveTimestamp < 1.5 * defaultSettings.intervals.lastActive &&
        lastActiveWindow !== window.name) {
            ReactDOM.render(
                i18n.getFunction('alreadyActive')(),
                document.getElementById('root'));
        return;
    }

    const updateLastActive = () =>
        localStorage.setItem('lastActive', JSON.stringify([window.name, +new Date]));
    updateLastActive();
    window.setInterval(updateLastActive, defaultSettings.intervals.lastActive);

    window.addEventListener('beforeunload', (e: BeforeUnloadEvent) => {
        if (numberofUnflushedMessages() > 0)
            e.returnValue = i18n.getFunction('hasUnflushedMessages')(numberofUnflushedMessages());
    });

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
})();