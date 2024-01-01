import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from './store/configureStore';
import { fromJS } from 'immutable';

import App from './App';

let initialState;

const render = (Component: React.FC, store: any) => {
    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
        <React.StrictMode>
            <Provider store={store}>
                <Router>
                    <Component />
                </Router>
            </Provider>
        </React.StrictMode>
    );
};
const username = window.location.pathname.split('/')[2];
const xhr = new XMLHttpRequest();
xhr.open('GET', `/api/users/${username}/get-todolist`, true);
xhr.send();
xhr.onreadystatechange = function () {
    if (this.readyState !== 4) {
        return;
    }
    if (this.status !== 200) {
        return;
    }
    const todoList = JSON.parse(this.responseText);

    const normalizedCatStorage = {};
    const normalizedItemsStorage = {};
    for (const item of todoList.itemsStorage) {
        normalizedItemsStorage[item.id] = item;
    }
    for (const cat of todoList.categoriesStorage) {
        normalizedCatStorage[cat.id] = cat;
    }
    const normalizedTodoList = {
        ...todoList,
        categoriesStorage: normalizedCatStorage,
        itemsStorage: normalizedItemsStorage,
    };
    initialState = {
        todoList: fromJS(normalizedTodoList),
        appView: fromJS({
            chosenCategoryId: null,
            chosenItemToEditId: null,
            showCompleted: false,
            filter: '',
        }),
    };
    const store = configureStore(initialState);
    render(App, store);
};

// render(App);
