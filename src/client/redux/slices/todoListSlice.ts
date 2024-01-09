import { buildCreateSlice, asyncThunkCreator } from '@reduxjs/toolkit';
import { setItems } from './todoItemsSlice';
import type { TodoItem } from './todoItemsSlice';
import {
    setCategories,
    removeCategoryFromParent,
    deleteCategories,
    addCategory,
    renameCategory,
} from './todoCategoriesSlice';
import type {
    TodoCategory,
    TodoCategoryRenameOptions,
} from './todoCategoriesSlice';
import type { RootState } from '../store';

type TodoListFetchResponse = {
    _id: string;
    itemsStorage: TodoItem[];
    categoriesStorage: TodoCategory[];
};

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

function calcCategoriesToDelete(rootCatId: string, state: RootState): string[] {
    const { idsGroupedByParent } = state.todoCategories;
    const childCatIds = idsGroupedByParent[rootCatId];
    if (childCatIds.length) {
        const categoriesIdsToDelete = childCatIds.flatMap((childCatId) =>
            calcCategoriesToDelete(childCatId, state)
        );
        return [...childCatIds, ...categoriesIdsToDelete];
    }

    return [];
}

export const todoListSlice = createTodoSlice({
    name: 'todoList',
    initialState: initialState,
    reducers: (create) => ({
        fetchTodoList: create.asyncThunk(
            async (user: string, thunkApi) => {
                const res = await fetch(`/api/users/${user}/get-todolist`);
                const todoList: TodoListFetchResponse = await res.json();
                const { dispatch } = thunkApi;
                dispatch(setItems(todoList.itemsStorage));
                dispatch(setCategories(todoList.categoriesStorage));

                return { user, id: todoList._id };
            },
            {
                pending: (state) => {
                    state.loading = true;
                },
                rejected: (state) => {
                    state.loading = false;
                },
                fulfilled: (state, action) => {
                    const { user, id } = action.payload;
                    state.loading = false;
                    state.id = id;
                    state.user = user;
                },
            }
        ),
        addTodoCategory: create.asyncThunk(
            async (category: TodoCategory, { dispatch, getState }) => {
                const state = getState() as RootState;

                const options: RequestInit = {
                    method: 'POST',
                    headers: new Headers({
                        'Content-type': 'application/json; charset=utf-8',
                    }),
                    body: JSON.stringify({
                        todoCat: category,
                    }),
                    credentials: 'include',
                };
                await fetch(
                    `/api/todolists/${state.todoList.id}/add-category`,
                    options
                );
                dispatch(addCategory(category));
            }
        ),
        renameTodoCategory: create.asyncThunk(
            async (params: TodoCategoryRenameOptions, thunkApi) => {
                const {
                    id,
                    changes: { name },
                } = params;
                const options: RequestInit = {
                    method: 'POST',
                    headers: new Headers({
                        'Content-type': 'application/json; charset=utf-8',
                    }),
                    body: JSON.stringify({
                        id,
                        newName: name,
                    }),
                    credentials: 'include',
                };
                const { dispatch, getState } = thunkApi;
                const { todoList } = getState() as RootState;
                await fetch(
                    `/api/todolists/${todoList.id}/rename-category`,
                    options
                );
                dispatch(renameCategory(params));
            }
        ),
        deleteTodoCategory: create.asyncThunk(
            async (categoryId: string, { dispatch, getState }) => {
                const options: RequestInit = {
                    method: 'POST',
                    headers: new Headers({
                        'Content-type': 'application/json; charset=utf-8',
                    }),
                    body: JSON.stringify({
                        id: categoryId,
                    }),
                    credentials: 'include',
                };
                const state = getState() as RootState;
                await fetch(
                    `/api/todolists/${state.todoList.id}/delete-category`,
                    options
                );
                dispatch(removeCategoryFromParent(categoryId));
                const categoriesIdsToDelete = [categoryId].concat(
                    calcCategoriesToDelete(categoryId, state)
                );
                dispatch(deleteCategories(categoriesIdsToDelete));
            }
        ),
    }),
});

export const {
    fetchTodoList,
    addTodoCategory,
    renameTodoCategory,
    deleteTodoCategory,
} = todoListSlice.actions;

export default todoListSlice.reducer;
