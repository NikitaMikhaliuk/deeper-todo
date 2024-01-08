import { fromJS, List } from 'immutable';
import * as constants from '../constants';
import { nameToUrl } from '../utils';

function updateCategoriesProgress(categoryId, state) {
    let chekingCatId = categoryId;
    let newState = state;
    let todoCat;
    while (chekingCatId !== 'root') {
        todoCat = newState.getIn(['categoriesStorage', chekingCatId]).toJS();
        if (
            todoCat.itemsIds.every((itemId) =>
                newState.getIn(['itemsStorage', itemId, 'completed'])
            )
        ) {
            newState = newState.setIn(
                ['categoriesStorage', chekingCatId, 'completed'],
                true
            );
            if (
                todoCat.categoriesIds.every(
                    (catId) =>
                        !newState.getIn(['categoriesStorage', catId, 'visible'])
                ) &&
                todoCat.itemsIds.length !== 0
            ) {
                newState = newState.setIn(
                    ['categoriesStorage', chekingCatId, 'visible'],
                    false
                );
            }
        } else {
            break;
        }
        chekingCatId = todoCat.parentCategoryId;
    }
    const categoriesStorage = newState.get('categoriesStorage');
    const currentProgress =
        categoriesStorage.filter((catItem) => catItem.toJS().completed).size /
        categoriesStorage.size;
    newState = newState.set('totalProgress', currentProgress);
    return newState;
}

function updateHistory(prevState, nextState) {
    return nextState.set('prevState', fromJS(prevState));
}

function rebuildLinkPaths(state, id, parentLinkPath) {
    let newState = state;
    let cat = newState.getIn(['categoriesStorage', id]).toJS();
    let newLinkPath = parentLinkPath + nameToUrl(cat.name);
    newState = newState.setIn(
        ['categoriesStorage', id, 'linkPath'],
        newLinkPath
    );
    cat.categoriesIds.forEach((catId) => {
        newState = cat.categoriesIds.length
            ? rebuildLinkPaths(newState, catId, newLinkPath)
            : newState;
    });
    return newState;
}

function renameCategory(params, state) {
    const { id, newName } = params;
    const oldLinkPath = state.getIn(['categoriesStorage', id, 'linkPath']);
    const newLinkPath = oldLinkPath.split('/').slice(0, -1).join('/');
    let newState = state.setIn(['categoriesStorage', id, 'name'], newName);
    newState = newState.setIn(
        ['categoriesStorage', id, 'linkPath'],
        newLinkPath
    );
    newState = rebuildLinkPaths(newState, id, newLinkPath);
    newState = updateHistory(state, newState);
    return newState;
}

function addCategory(params, state) {
    const { parentCategoryId, name, id } = params;

    const parentPathArr =
        parentCategoryId === 'root'
            ? ['root']
            : ['categoriesStorage', parentCategoryId];
    let parentNestedIds = state.getIn(parentPathArr.concat(['categoriesIds']));
    parentNestedIds = List([id]).concat(parentNestedIds);
    let newState = state.setIn(
        parentPathArr.concat(['categoriesIds']),
        parentNestedIds
    );

    const parentLinkPath = newState.getIn(parentPathArr.concat(['linkPath']));
    const newCat = fromJS({
        parentCategoryId,
        id,
        name,
        linkPath: parentLinkPath + nameToUrl(name),
        completed: false,
        visible: true,
        categoriesIds: [],
        itemsIds: [],
    });
    newState = newState.setIn(['categoriesStorage', id], newCat);
    newState = updateCategoriesProgress(parentCategoryId, newState);
    newState = updateHistory(state, newState);
    return newState;
}

function deleteCategory(params, state) {
    const { parentCategoryId, categoryId } = params;
    const parentNestedCatsPathArr =
        parentCategoryId === 'root'
            ? ['root', 'categoriesIds']
            : ['categoriesStorage', parentCategoryId, 'categoriesIds'];

    let parentNestedIds = state.getIn(parentNestedCatsPathArr);
    parentNestedIds = parentNestedIds.filter((idItem) => idItem !== categoryId);
    let newState = state.setIn(parentNestedCatsPathArr, parentNestedIds);

    const deleteCategory = (catId) => {
        let nestedItemsIds = newState
            .getIn(['categoriesStorage', catId, 'itemsIds'])
            .toJS();
        nestedItemsIds.forEach((itemId) => {
            newState = newState.removeIn(['itemsStorage', itemId]);
        });

        let nestedCatsIds = newState
            .getIn(['categoriesStorage', catId, 'categoriesIds'])
            .toJS();
        nestedCatsIds.forEach((nestedCatId) => {
            deleteCategory(nestedCatId);
        });
        newState = newState.removeIn(['categoriesStorage', catId]);
    };
    deleteCategory(categoryId);
    newState = updateCategoriesProgress(parentCategoryId, newState);
    newState = updateHistory(state, newState);
    return newState;
}

function addTodoItem(params, state) {
    const { id, name, parentCategoryId } = params;
    let newItem = fromJS({
        name,
        id,
        parentCategoryId,
        completed: false,
    });
    let newState = state.setIn(['itemsStorage', id], newItem);
    let parrentItemsIds = newState.getIn([
        'categoriesStorage',
        parentCategoryId,
        'itemsIds',
    ]);
    parrentItemsIds = List([id]).concat(parrentItemsIds);
    newState = newState.setIn(
        ['categoriesStorage', parentCategoryId, 'itemsIds'],
        parrentItemsIds
    );
    newState = newState.setIn(
        ['categoriesStorage', parentCategoryId, 'completed'],
        false
    );
    newState = updateHistory(state, newState);
    return newState;
}

function EditTodoItem(params, state) {
    const { id, isCompleted, newName, newDescription } = params;
    let newState = state.setIn(['itemsStorage', id, 'completed'], isCompleted);
    newState = newName
        ? newState.setIn(['itemsStorage', id, 'name'], newName)
        : newState;
    newState =
        newDescription !== null
            ? newState.setIn(
                  ['itemsStorage', id, 'description'],
                  newDescription
              )
            : newState;
    const parentCategoryId = newState.getIn([
        'itemsStorage',
        id,
        'parentCategoryId',
    ]);
    newState = updateCategoriesProgress(parentCategoryId, newState);
    newState = updateHistory(state, newState);
    return newState;
}

function MoveTodoItem(params, state) {
    const { itemId, newParentCategory } = params;
    const parentCatId = state.getIn([
        'itemsStorage',
        itemId,
        'parentCategoryId',
    ]);
    let parentItemsIds = state.getIn([
        'categoriesStorage',
        parentCatId,
        'itemsIds',
    ]);
    parentItemsIds = parentItemsIds.filter((id) => id !== itemId);
    let newState = state.setIn(
        ['categoriesStorage', parentCatId, 'itemsIds'],
        parentItemsIds
    );
    let newParentItemsIds = state.getIn([
        'categoriesStorage',
        newParentCategory,
        'itemsIds',
    ]);
    newParentItemsIds = List([itemId]).concat(newParentItemsIds);
    newState = newState.setIn(
        ['categoriesStorage', newParentCategory, 'itemsIds'],
        newParentItemsIds
    );
    newState = newState.setIn(
        ['itemsStorage', itemId, 'parentCategoryId'],
        newParentCategory
    );
    newState = updateCategoriesProgress(parentCatId, newState);
    newState = updateHistory(state, newState);
    return newState;
}

function Undo(state) {
    let newState = state.get('prevState');
    if (newState) {
        newState = newState.set('nextState', state);
        return newState;
    }
    return state;
}

function Redo(state) {
    let newState = state.get('nextState');
    return newState ? newState : state;
}

export default function todoList(state = fromJS({}), action) {
    switch (action.type) {
        case constants.RENAME_CATEGORY:
            return renameCategory(action.payload, state);

        case constants.ADD_CATEGORY:
            return addCategory(action.payload, state);

        case constants.DELETE_CATEGORY:
            return deleteCategory(action.payload, state);

        case constants.ADD_TODO_ITEM:
            return addTodoItem(action.payload, state);

        case constants.EDIT_TODO_ITEM:
            return EditTodoItem(action.payload, state);

        case constants.MOVE_TODO_ITEM:
            return MoveTodoItem(action.payload, state);

        case constants.UNDO:
            return Undo(state);

        case constants.REDO:
            return Redo(state);

        default:
            return state;
    }
}
