import { configureStore } from '@reduxjs/toolkit';
import type { Dispatch, Middleware, UnknownAction } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import appViewReducer from './slices/appViewSlice';
import todoListReducer from './slices/todoListSlice';
import todoItemsReducer from './slices/todoItemsSlice';
import todoCategoriesReducer from './slices/todoCategoriesSlice';

const logger = createLogger({ diff: true, level: 'log' }) as Middleware<
    unknown,
    unknown,
    Dispatch<UnknownAction>
>;

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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
