import {
    createSlice,
    createEntityAdapter,
    createSelector,
    PayloadAction,
} from '@reduxjs/toolkit';

import { groupBy } from '../../utils';
import { addCategory, deleteCategories } from './todoCategoriesSlice';

export type TodoItem = {
    id: string;
    _id?: string;
    parentCategoryId: string;
    name: string;
    description?: string;
    completed: boolean;
};

export type TodoItemEditOptions = {
    id: string;
    changes: Partial<Omit<TodoItem, 'id' | '_id'>>;
};

export type TodoItemMoveOptions = {
    id: string;
    changes: Pick<TodoItem, 'parentCategoryId'>;
};

type InitialState = {
    idsGroupedByParent: Record<string, string[]>;
};

const todoItemsAdapter = createEntityAdapter<TodoItem>({});
const { selectAll, selectById, selectEntities, selectTotal } =
    todoItemsAdapter.getSelectors();

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
            const { [parentCategoryId]: categoryItems } = state.idsGroupedByParent;
            if (!categoryItems) {
                state.idsGroupedByParent[parentCategoryId] = [id];
            } else {
                categoryItems.unshift(id);
            }
        },
        editItem: (state, action: PayloadAction<TodoItemEditOptions>) => {
            todoItemsAdapter.updateOne(state, action.payload);
        },
        moveItem: (state, action: PayloadAction<TodoItemMoveOptions>) => {
            const {
                id,
                changes: { parentCategoryId: newParentCategoryId },
            } = action.payload;
            const { parentCategoryId: oldParentCategoryId } = state.entities[id];
            todoItemsAdapter.updateOne(state, action.payload);

            const { [newParentCategoryId]: newParentChildIds } =
                state.idsGroupedByParent;
            if (!newParentChildIds) {
                state.idsGroupedByParent[newParentCategoryId] = [id];
            } else {
                newParentChildIds.unshift(id);
            }
            const oldParentChildIds = state.idsGroupedByParent[oldParentCategoryId];
            state.idsGroupedByParent[oldParentCategoryId] = oldParentChildIds.filter(
                (itemId) => itemId !== id
            );
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
        builder.addCase(addCategory, (state, action) => {
            const { id } = action.payload;
            state.idsGroupedByParent[id] = [];
        });
    },
    selectors: {
        getItemById: selectById,
        getAllItems: selectAll,
        getItemsByParent: createSelector(
            [
                (state: TodoItemsSliceState, categoryId: string) =>
                    state.idsGroupedByParent[categoryId],
                (state: TodoItemsSliceState) => selectEntities(state),
            ],
            (itemIds = [], entities) => itemIds.map((itemId) => entities[itemId])
        ),
        getProgress: createSelector(
            [
                (state: TodoItemsSliceState) => selectAll(state),
                (state: TodoItemsSliceState) => selectTotal(state),
            ],
            (items, itemsTotal) => {
                const completedItemsTotal = items.filter(
                    (item) => item.completed
                ).length;
                return Math.round((completedItemsTotal / itemsTotal) * 100);
            }
        ),
    },
});

export const { setItems, addItem, editItem, moveItem, deleteItem } =
    todoItemsSlice.actions;
export const { getItemById, getAllItems, getItemsByParent, getProgress } =
    todoItemsSlice.selectors;

export default todoItemsSlice.reducer;
