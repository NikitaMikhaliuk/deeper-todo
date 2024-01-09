import { buildCreateSlice, asyncThunkCreator } from '@reduxjs/toolkit';
import type { TodoItem } from './todoItemsSlice';
import type { TodoCategory } from './todoCategoriesSlice';

type TodoListHistoryEntry = {
    items: TodoItem[];
    categories: TodoCategory[];
    itemIdsGroupedByParent: Record<string, string[]>;
    categoryIdsGroupedByParent: Record<string, string[]>;
};

type InitialState = {
    user: string;
    error: string;
    loading: boolean;
    id: string;
    past: TodoListHistoryEntry[];
    future: TodoListHistoryEntry[];
};
const initialState: InitialState = {
    user: '',
    loading: false,
    error: '',
    past: [],
    future: [],
    id: '',
};

const createTodoSlice = buildCreateSlice({
    creators: { asyncThunk: asyncThunkCreator },
});

export const todoListSlice = createTodoSlice({
    name: 'todoList',
    initialState: initialState,
    reducers: {},
});

export default todoListSlice.reducer;
