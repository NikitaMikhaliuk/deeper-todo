import { combineReducers } from 'redux';
import todoList from './todoList.js';
import appView from './appView.js';

export default combineReducers({
    todoList,
    appView,
});
