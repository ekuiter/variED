import React from 'react';
import ReactDOM from 'react-dom';
import AppContainer from './AppContainer';
import 'normalize.css';
import './index.css';
import 'promise-polyfill/src/polyfill';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import reducers from './reducers';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

if (window.location.protocol !== 'http:')
    window.location.protocol = 'http:'; // TODO: hack until we support WSS

initializeIcons();

const store = createStore(
    reducers,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render((
    <Provider store={store}>
        <AppContainer/>
    </Provider>
), document.getElementById('root'));