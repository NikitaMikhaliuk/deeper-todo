import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import appViewReducer from './slices/appViewSlice';
import todoListReducer from './slices/todoListSlice';
import todoItemsReducer from './slices/todoItemsSlice';
import todoCategoriesReducer from './slices/todoCategoriesSlice';

console.log('import.meta.env.DEV:', import.meta.env.DEV);

const logger = createLogger({ diff: true, level: 'log' });

const middlewares = import.meta.env.DEV ? [logger] : [];

const store = configureStore({
    reducer: {
        appView: appViewReducer,
        todoList: todoListReducer,
        todoItems: todoItemsReducer,
        todoCategories: todoCategoriesReducer,
    },
    devTools: import.meta.env.DEV,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(middlewares),
});

export default store;
