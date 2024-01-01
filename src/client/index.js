import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'babel-polyfill';
import App from './App';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from './store/configureStore';
import { fromJS } from 'immutable';

let initialState;
let store;

const render = (Component) => {
    ReactDOM.render(
        <Provider store={store}>
            <Router>
                <Component />
            </Router>
        </Provider>,
        document.getElementById('root')
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

    let normalizedCatStorage = {};
    let normalizedItemsStorage = {};
    for (let item of todoList.itemsStorage) {
        normalizedItemsStorage[item.id] = item;
    }
    for (let cat of todoList.categoriesStorage) {
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
    store = configureStore(initialState);
    render(App);
};
