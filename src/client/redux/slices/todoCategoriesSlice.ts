import {
    createSlice,
    createEntityAdapter,
    PayloadAction,
    createSelector,
} from '@reduxjs/toolkit';
import { groupBy, nameToUrl } from '../../utils';
import type { RootState } from '../store';

export type TodoCategory = {
    id: string;
    _id?: string;
    parentCategoryId: string;
    linkPath: string;
    name: string;
    completed: boolean;
    visible?: boolean;
};

export type TodoCategoryRenameOptions = {
    id: string;
    changes: Pick<TodoCategory, 'name'>;
};

const todoCategoriesAdapter = createEntityAdapter<TodoCategory>({});

type InitialState = {
    idsGroupedByParent: Record<string, string[]>;
};

export const todoCategoriesSlice = createSlice({
    name: 'todoCategories',
    reducerPath: 'todoCategories',
    initialState: todoCategoriesAdapter.getInitialState<InitialState>({
        idsGroupedByParent: {},
    }),
    reducers: {
        setCategories: (state, action: PayloadAction<TodoCategory[]>) => {
            todoCategoriesAdapter.setAll(state, action);
            state.idsGroupedByParent = groupBy(
                state.ids,
                (id) => state.entities[id].parentCategoryId
            );
        },
        addCategory: (state, action: PayloadAction<TodoCategory>) => {
            todoCategoriesAdapter.addOne(state, action);
            const { id, parentCategoryId } = action.payload;
            const { [parentCategoryId]: parentCatChidIds } =
                state.idsGroupedByParent;
            parentCatChidIds.unshift(id);
        },
        renameCategory: (
            state,
            action: PayloadAction<TodoCategoryRenameOptions>
        ) => {
            const { id } = action.payload;
            const { name: oldName } = state.entities[id];
            const oldEscapedName = nameToUrl(oldName);
            todoCategoriesAdapter.updateOne(state, action.payload);
            const { name: newName } = action.payload.changes;
            const newEscapedName = nameToUrl(newName);
            const categories = todoCategoriesAdapter
                .getSelectors()
                .selectAll(state);
            const linkPathsChanges = categories
                .filter((category) =>
                    category.linkPath.includes(oldEscapedName)
                )
                .map((category) => ({
                    id: category.id,
                    changes: {
                        linkPath: category.linkPath.replace(
                            oldEscapedName,
                            newEscapedName
                        ),
                    },
                }));
            todoCategoriesAdapter.updateMany(state, linkPathsChanges);
        },
        removeCategoryFromParent: (state, action: PayloadAction<string>) => {
            const { id, parentCategoryId } = state.entities[action.payload];
            let { [parentCategoryId]: parentCatChildIds } =
                state.idsGroupedByParent;
            parentCatChildIds = parentCatChildIds.filter(
                (catId) => catId !== id
            );
            state.idsGroupedByParent[parentCategoryId] = parentCatChildIds;
        },
        deleteCategories: (state, action: PayloadAction<string[]>) => {
            todoCategoriesAdapter.removeMany(state, action.payload);
            for (const id of action.payload) {
                delete state.idsGroupedByParent[id];
            }
        },
    },
    selectors: {
        getCategoryById: todoCategoriesAdapter.getSelectors().selectById,
    },
});

export const {
    setCategories,
    addCategory,
    renameCategory,
    removeCategoryFromParent,
    deleteCategories,
} = todoCategoriesSlice.actions;
export const { getCategoryById } = todoCategoriesSlice.selectors;

export const makeGetCategoryIdsByParent = (parentId: string) =>
    createSelector(
        [(state: RootState) => state.todoCategories],
        (state) => state.idsGroupedByParent[parentId]
    );

export default todoCategoriesSlice.reducer;
