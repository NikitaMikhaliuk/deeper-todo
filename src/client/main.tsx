import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from './store/configureStore';
import { fromJS } from 'immutable';

import App from './App';

//const store = configureStore(initialState);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Provider store={{}}>
            <Router>
                <App />
            </Router>
        </Provider>
    </React.StrictMode>
);
