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
    itemsCompleted?: boolean;
    visible?: boolean;
};

export type TodoCategoryRenameOptions = {
    id: string;
    changes: Pick<TodoCategory, 'name'>;
};

const todoCategoriesAdapter = createEntityAdapter<TodoCategory>({});
const { selectAll, selectById } = todoCategoriesAdapter.getSelectors();

type InitialState = {
    idsGroupedByParent: Record<string, string[]>;
};

type TodoCategoriesSliceState = InitialState &
    ReturnType<typeof todoCategoriesAdapter.getInitialState>;

const checkCategoryCompleted = (
    state: TodoCategoriesSliceState,
    catId: string
): boolean => {
    const nestedCatIds = state.idsGroupedByParent[catId];
    const { itemsCompleted } = selectById(state, catId);
    if (!nestedCatIds || !nestedCatIds.length) {
        return !!itemsCompleted;
    }

    return (
        nestedCatIds.every((id) => selectById(state, id).completed) && !!itemsCompleted
    );
};

const updateCategoriesCompleted = (state: TodoCategoriesSliceState, catId: string) => {
    if (checkCategoryCompleted(state, catId)) {
        const { parentCategoryId } = state.entities[catId];
        todoCategoriesAdapter.updateOne(state, {
            id: catId,
            changes: {
                completed: true,
                visible: false,
            },
        });
        if (parentCategoryId !== 'root') {
            updateCategoriesCompleted(state, parentCategoryId);
        }
    }
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
            const { [parentCategoryId]: parentCatChidIds } = state.idsGroupedByParent;
            parentCatChidIds.unshift(id);
        },
        onItemsCompletedChange: (
            state,
            action: PayloadAction<{ id: string; itemsCompleted: boolean }>
        ) => {
            const { id, itemsCompleted } = action.payload;
            todoCategoriesAdapter.updateOne(state, {
                id,
                changes: {
                    itemsCompleted,
                },
            });
            updateCategoriesCompleted(state, id);
        },
        renameCategory: (state, action: PayloadAction<TodoCategoryRenameOptions>) => {
            const { id } = action.payload;
            const { name: oldName } = state.entities[id];
            const oldEscapedName = nameToUrl(oldName);
            todoCategoriesAdapter.updateOne(state, action.payload);
            const { name: newName } = action.payload.changes;
            const newEscapedName = nameToUrl(newName);
            const categories = todoCategoriesAdapter.getSelectors().selectAll(state);
            const linkPathsChanges = categories
                .filter((category) => category.linkPath.includes(oldEscapedName))
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
            let { [parentCategoryId]: parentCatChildIds } = state.idsGroupedByParent;
            parentCatChildIds = parentCatChildIds.filter((catId) => catId !== id);
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
        getAllCategories: selectAll,
        getCategoryById: selectById,
    },
});

export const {
    setCategories,
    addCategory,
    renameCategory,
    removeCategoryFromParent,
    deleteCategories,
    onItemsCompletedChange,
} = todoCategoriesSlice.actions;
export const { getAllCategories, getCategoryById } = todoCategoriesSlice.selectors;

export const makeGetCategoryIdsByParent = (parentId: string) =>
    createSelector(
        [(state: RootState) => state.todoCategories.idsGroupedByParent[parentId]],
        (ids) => ids || []
    );

export const makeGetCategoriesByIds = (catIds: string[]) => {
    const inputCategoriesSelectors = catIds.map(
        (catId) => (state: RootState) => getCategoryById(state, catId)
    );
    return createSelector([...inputCategoriesSelectors], (...categories) => {
        console.log('categories', categories);
        return categories;
    });
};

export default todoCategoriesSlice.reducer;
