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

function updateHistory(
    state: TodoListSliceState,
    action: PayloadAction<TodoListHistoryEntry>
) {
    state.past.push(action.payload);
    state.future = [];
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
                const prevState = getState() as RootState;
                const prevStateHistoryEntry = makeHistoryEntry(prevState);

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
                    `/api/todolists/${prevState.todoList.id}/add-category`,
                    options
                );
                dispatch(addCategory(category));
                return prevStateHistoryEntry;
            },
            { fulfilled: updateHistory }
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
                const prevState = getState() as RootState;
                const prevStateHistoryEntry = makeHistoryEntry(prevState);
                await fetch(
                    `/api/todolists/${prevState.todoList.id}/rename-category`,
                    options
                );
                dispatch(renameCategory(params));
                return prevStateHistoryEntry;
            },
            { fulfilled: updateHistory }
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
                const prevState = getState() as RootState;
                const prevStateHistoryEntry = makeHistoryEntry(prevState);
                await fetch(
                    `/api/todolists/${prevState.todoList.id}/delete-category`,
                    options
                );
                dispatch(removeCategoryFromParent(categoryId));
                const categoriesIdsToDelete = [categoryId].concat(
                    calcCategoriesToDelete(categoryId, prevState)
                );
                dispatch(deleteCategories(categoriesIdsToDelete));
                return prevStateHistoryEntry;
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
                const prevState = getState() as RootState;
                const prevStateHistoryEntry = makeHistoryEntry(prevState);
                await fetch(
                    `/api/todolists/${prevState.todoList.id}/add-todotask`,
                    options
                );
                dispatch(addItem(item));
                return prevStateHistoryEntry;
            },
            { fulfilled: updateHistory }
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
                const prevState = getState() as RootState;
                const prevStateHistoryEntry = makeHistoryEntry(prevState);
                await fetch(
                    `/api/todolists/${prevState.todoList.id}/edit-todotask`,
                    options
                );

                dispatch(editItem(params));

                // update category 'itemsCompleted' state if all items are completed
                const udatedState = getState() as RootState;
                const { parentCategoryId } = getItemById(udatedState, id);
                const categoryItems = getItemsByParent(udatedState, parentCategoryId);
                if (categoryItems.every((item) => item.completed)) {
                    dispatch(
                        onItemsCompletedChange({
                            id: parentCategoryId,
                            itemsCompleted: true,
                        })
                    );
                }

                return prevStateHistoryEntry;
            },
            { fulfilled: updateHistory }
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
                        newParentCategory: parentCategoryId,
                    }),
                    credentials: 'include',
                };
                const prevState = getState() as RootState;
                const prevStateHistoryEntry = makeHistoryEntry(prevState);
                await fetch(
                    `/api/todolists/${prevState.todoList.id}/move-todotask`,
                    options
                );
                dispatch(moveItem(params));
                return prevStateHistoryEntry;
            },
            { fulfilled: updateHistory }
        ),
        undo: create.asyncThunk(
            async (
                _: void,
                { getState, dispatch }
            ): Promise<TodoListHistoryEntry | void> => {
                const currentState = getState() as RootState;
                const currentStateHistoryEntry = makeHistoryEntry(currentState);
                const prevStateEntry = currentState.todoList.past.at(-1);
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
                    await fetch(
                        `/api/todolists/${currentState.todoList.id}/undo`,
                        options
                    );
                    dispatch(setItems(items));
                    dispatch(setCategories(categories));

                    return currentStateHistoryEntry;
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
                const currentState = getState() as RootState;
                const currentStateHistoryEntry = makeHistoryEntry(currentState);
                const nextStateEntry = currentState.todoList.future.at(-1);
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
                    await fetch(
                        `/api/todolists/${currentState.todoList.id}/redo`,
                        options
                    );
                    dispatch(setItems(items));
                    dispatch(setCategories(categories));

                    return currentStateHistoryEntry;
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
