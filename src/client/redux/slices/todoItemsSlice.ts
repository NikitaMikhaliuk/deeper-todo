import {
    createSlice,
    createEntityAdapter,
    createSelector,
    PayloadAction,
} from '@reduxjs/toolkit';

import { groupBy } from '../../utils';
import { deleteCategories } from './todoCategoriesSlice';

export type TodoItem = {
    id: string;
    _id?: string;
    parentCategoryId: string;
    name: string;
    description: string;
    completed: boolean;
};

type TodoItemEditOptions = {
    id: string;
    changes: Partial<Omit<TodoItem, 'id' | '_id'>>;
};

type TodoItemMoveOptions = {
    id: string;
    changes: Pick<TodoItem, 'parentCategoryId'>;
};

const todoItemsAdapter = createEntityAdapter<TodoItem>({});

type InitialState = {
    idsGroupedByParent: Record<string, string[]>;
};

type TodoItemsSliceState = InitialState &
    ReturnType<typeof todoItemsAdapter.getInitialState>;

export const todoItemsSlice = createSlice({
    name: 'todoItems',
    reducerPath: 'todoItems',
    initialState: todoItemsAdapter.getInitialState<InitialState>({
        idsGroupedByParent: {},
    }),
    reducers: {
        setItems: (state, action: PayloadAction<TodoItem[]>) => {
            todoItemsAdapter.setAll(state, action);
            state.idsGroupedByParent = groupBy(
                state.ids,
                (id) => state.entities[id].parentCategoryId
            );
        },
        addItem: (state, action: PayloadAction<TodoItem>) => {
            todoItemsAdapter.addOne(state, action);
            const { id, parentCategoryId } = action.payload;
            const { [parentCategoryId]: categoryItems } =
                state.idsGroupedByParent;
            categoryItems.unshift(id);
        },
        editItem: (state, action: PayloadAction<TodoItemEditOptions>) => {
            todoItemsAdapter.updateOne(state, action.payload);
        },
        moveItem: (state, action: PayloadAction<TodoItemMoveOptions>) => {
            todoItemsAdapter.updateOne(state, action.payload);
            const {
                id,
                changes: { parentCategoryId: newParentCategoryId },
            } = action.payload;
            const newParentChildIds =
                state.idsGroupedByParent[newParentCategoryId];
            state.idsGroupedByParent[newParentCategoryId] = [
                id,
                ...newParentChildIds,
            ];
            const { parentCategoryId: oldParentCategoryId } =
                state.entities[id];
            const oldParentChildIds =
                state.idsGroupedByParent[oldParentCategoryId];
            state.idsGroupedByParent[oldParentCategoryId] =
                oldParentChildIds.filter((itemId) => itemId !== id);
        },
        deleteItem: (state, action: PayloadAction<string>) => {
            const { id, parentCategoryId } = state.entities[action.payload];
            todoItemsAdapter.removeOne(state, id);
            const { [parentCategoryId]: itemIds } = state.idsGroupedByParent;
            state.idsGroupedByParent[parentCategoryId] = itemIds.filter(
                (itemId) => itemId !== id
            );
        },
    },
    extraReducers: (builder) => {
        builder.addCase(deleteCategories, (state, action) => {
            const itemsToDelete = [];
            for (const catId of action.payload) {
                const { [catId]: itemIds } = state.idsGroupedByParent;
                itemsToDelete.push(...itemIds);
                delete state.idsGroupedByParent[catId];
            }
            todoItemsAdapter.removeMany(state, itemsToDelete);
        });
    },
    selectors: {
        getItemById: todoItemsAdapter.getSelectors().selectById,
        getItemIdsByParent: createSelector(
            [
                (state: TodoItemsSliceState) => state,
                (_state, categoryId: string) => categoryId,
            ],
            (state, categoryId) => state.idsGroupedByParent[categoryId]
        ),
        getProgress: createSelector(
            [
                (state: TodoItemsSliceState) => state,
                (state: TodoItemsSliceState) =>
                    todoItemsAdapter.getSelectors().selectTotal(state),
            ],
            (state, itemsTotal) => {
                const completedItemsTotal = todoItemsAdapter
                    .getSelectors()
                    .selectAll(state)
                    .filter((item) => item.completed).length;
                return Math.round((completedItemsTotal / itemsTotal) * 100);
            }
        ),
    },
});

export const { setItems, addItem, deleteItem } = todoItemsSlice.actions;
export const { getItemById, getItemIdsByParent, getProgress } =
    todoItemsSlice.selectors;

export default todoItemsSlice.reducer;
