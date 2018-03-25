import { combineReducers } from 'redux';
import todoList from './todoList';
import appView from './appView';

export default combineReducers({
  todoList,
  appView
})