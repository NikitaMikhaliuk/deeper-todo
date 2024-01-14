import { buildCreateSlice, asyncThunkCreator, PayloadAction } from '@reduxjs/toolkit';
import {
    addItem,
    editItem,
    getAllItems,
    getItemById,
    getItemsByParent,
    moveItem,
    setItems,
} from './todoItemsSlice';
import type {
    TodoItem,
    TodoItemEditOptions,
    TodoItemMoveOptions,
} from './todoItemsSlice';
import {
    setCategories,
    removeCategoryFromParent,
    deleteCategories,
    addCategory,
    renameCategory,
    getAllCategories,
    makeGetCategoryIdsByParent,
    onItemsCompletedChange,
} from './todoCategoriesSlice';
import type { TodoCategory, TodoCategoryRenameOptions } from './todoCategoriesSlice';
import type { RootState } from '../store';
import { getCategoriesRootPath } from '../../utils';

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
    root: {
        categoriesIds: string[];
        linkPath: string;
    };
};

type TodoListSliceState = {
    user: string;
    error: string;
    loading: boolean;
    id: string;
    past: TodoListHistoryEntry[];
    future: TodoListHistoryEntry[];
};
const initialState: TodoListSliceState = {
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

const getRootCatIds = makeGetCategoryIdsByParent('root');

function makeHistoryEntry(state: RootState): TodoListHistoryEntry {
    const categories = getAllCategories(state);
    const rootCategoriesIds = getRootCatIds(state);
    const items = getAllItems(state);
    const { idsGroupedByParent: categoryIdsGroupedByParent } = state.todoCategories;
    const { idsGroupedByParent: itemIdsGroupedByParent } = state.todoItems;
    return {
        root: {
            categoriesIds: rootCategoriesIds,
            linkPath: getCategoriesRootPath(state.todoList.user),
        },
        items,
        categories,
        categoryIdsGroupedByParent,
        itemIdsGroupedByParent,
    };
}

function saveHistoryEntry(
    state: TodoListSliceState,
    action: PayloadAction<TodoListHistoryEntry>
) {
    state.past.push(action.payload);
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
            async (
                category: TodoCategory,
                { dispatch, getState }
            ): Promise<TodoListHistoryEntry> => {
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
                return makeHistoryEntry(state);
            },
            { fulfilled: saveHistoryEntry }
        ),
        renameTodoCategory: create.asyncThunk(
            async (
                params: TodoCategoryRenameOptions,
                { dispatch, getState }
            ): Promise<TodoListHistoryEntry> => {
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
                const state = getState() as RootState;
                await fetch(
                    `/api/todolists/${state.todoList.id}/rename-category`,
                    options
                );
                dispatch(renameCategory(params));
                return makeHistoryEntry(state);
            },
            { fulfilled: saveHistoryEntry }
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
        addTodoItem: create.asyncThunk(
            async (
                item: TodoItem,
                { dispatch, getState }
            ): Promise<TodoListHistoryEntry> => {
                const options: RequestInit = {
                    method: 'POST',
                    headers: new Headers({
                        'Content-type': 'application/json; charset=utf-8',
                    }),
                    body: JSON.stringify({
                        ...item,
                    }),
                    credentials: 'include',
                };
                const state = getState() as RootState;
                await fetch(
                    `/api/todolists/${state.todoList.id}/add-todotask`,
                    options
                );
                dispatch(addItem(item));
                return makeHistoryEntry(state);
            },
            { fulfilled: saveHistoryEntry }
        ),
        editTodoItem: create.asyncThunk(
            async (
                params: TodoItemEditOptions,
                { dispatch, getState }
            ): Promise<TodoListHistoryEntry> => {
                const {
                    id,
                    changes: { completed, name, description },
                } = params;
                const options: RequestInit = {
                    method: 'POST',
                    headers: new Headers({
                        'Content-type': 'application/json; charset=utf-8',
                    }),
                    body: JSON.stringify({
                        id,
                        newName: name,
                        newDescription: description,
                        isCompleted: completed,
                    }),
                    credentials: 'include',
                };
                const state = getState() as RootState;
                await fetch(
                    `/api/todolists/${state.todoList.id}/edit-todotask`,
                    options
                );

                dispatch(editItem(params));

                // update category 'completed state if all items are completed
                const { parentCategoryId } = getItemById(state, id);
                const categoryItems = getItemsByParent(state, parentCategoryId);
                if (categoryItems.every((item) => item.completed)) {
                    dispatch(
                        onItemsCompletedChange({
                            id: parentCategoryId,
                            itemsCompleted: true,
                        })
                    );
                }

                return makeHistoryEntry(state);
            },
            { fulfilled: saveHistoryEntry }
        ),
        moveTodoItem: create.asyncThunk(
            async (
                params: TodoItemMoveOptions,
                { dispatch, getState }
            ): Promise<TodoListHistoryEntry> => {
                const {
                    id,
                    changes: { parentCategoryId },
                } = params;

                const options: RequestInit = {
                    method: 'POST',
                    headers: new Headers({
                        'Content-type': 'application/json; charset=utf-8',
                    }),
                    body: JSON.stringify({
                        itemId: id,
                        newParentCategoryId: parentCategoryId,
                    }),
                    credentials: 'include',
                };
                const state = getState() as RootState;
                await fetch(
                    `/api/todolists/${state.todoList.id}/move-todotask`,
                    options
                );
                dispatch(moveItem(params));
                return makeHistoryEntry(state);
            },
            { fulfilled: saveHistoryEntry }
        ),
        undo: create.asyncThunk(
            async (
                _: void,
                { getState, dispatch }
            ): Promise<TodoListHistoryEntry | void> => {
                const state = getState() as RootState;
                const prevStateEntry = state.todoList.past.at(-1);
                if (prevStateEntry) {
                    const { categories, items, root } = prevStateEntry;
                    const options: RequestInit = {
                        method: 'POST',
                        headers: new Headers({
                            'Content-type': 'application/json; charset=utf-8',
                        }),
                        body: JSON.stringify({
                            root,
                            categoriesStorage: categories,
                            itemsStorage: items,
                        }),
                        credentials: 'include',
                    };
                    await fetch(`/api/todolists/${state.todoList.id}/undo`, options);
                    dispatch(setItems(items));
                    dispatch(setCategories(categories));

                    return makeHistoryEntry(state);
                }
            },
            {
                fulfilled: (state, acttion) => {
                    if (acttion.payload) {
                        state.past.pop();
                        state.future.push(acttion.payload);
                    }
                },
            }
        ),
        redo: create.asyncThunk(
            async (
                _: void,
                { getState, dispatch }
            ): Promise<TodoListHistoryEntry | void> => {
                const state = getState() as RootState;
                const nextStateEntry = state.todoList.future.at(-1);
                if (nextStateEntry) {
                    const { categories, items, root } = nextStateEntry;
                    const options: RequestInit = {
                        method: 'POST',
                        headers: new Headers({
                            'Content-type': 'application/json; charset=utf-8',
                        }),
                        body: JSON.stringify({
                            root,
                            categoriesStorage: categories,
                            itemsStorage: items,
                        }),
                        credentials: 'include',
                    };
                    await fetch(`/api/todolists/${state.todoList.id}/redo`, options);
                    dispatch(setItems(items));
                    dispatch(setCategories(categories));

                    return makeHistoryEntry(state);
                }
            },
            {
                fulfilled: (state, acttion) => {
                    if (acttion.payload) {
                        state.future.pop();
                        state.past.push(acttion.payload);
                    }
                },
            }
        ),
    }),
    selectors: {
        getCanUndo: (state) => state.past.length > 0,
        getCanRedo: (state) => state.future.length > 0,
    },
});

export const {
    fetchTodoList,
    addTodoCategory,
    renameTodoCategory,
    deleteTodoCategory,
    addTodoItem,
    editTodoItem,
    moveTodoItem,
    undo,
    redo,
} = todoListSlice.actions;

export const { getCanUndo, getCanRedo } = todoListSlice.selectors;

export default todoListSlice.reducer;
