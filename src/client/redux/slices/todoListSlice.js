import { buildCreateSlice, asyncThunkCreator } from '@reduxjs/toolkit';

const createTodoSlice = buildCreateSlice({
    creators: { asyncThunk: asyncThunkCreator },
});

export const todoListSlice = createTodoSlice({
    name: 'todoList',
    initialState: {
        past: [],
        future: [],
        id: '',
        // progress: 0 // use selector function?
    },
});

export default todoListSlice.reducer;
