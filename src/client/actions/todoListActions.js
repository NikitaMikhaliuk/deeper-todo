import * as constants from '../constants';

export function AddCategory(parentCategoryId, name, id, linkPath) {
    return (dispatch, getState) => {
        const action = {
            type: constants.ADD_CATEGORY,
            payload: {
                parentCategoryId,
                name,
                id,
                linkPath,
            },
        };
        const options = {
            method: 'POST',
            headers: new Headers({
                'Content-type': 'application/json; charset=utf-8',
            }),
            body: JSON.stringify({
                todoCat: {
                    ...action.payload,
                },
            }),
            credentials: 'include',
        };
        fetch(
            `/api/todolists/${getState().todoList.toJS()._id}/add-category`,
            options
        ).then(() => {
            dispatch(action);
        });
    };
}

export function DeleteCategory(parentCategoryId, categoryId) {
    return (dispatch, getState) => {
        const action = {
            type: constants.DELETE_CATEGORY,
            payload: {
                parentCategoryId,
                categoryId,
            },
        };
        const options = {
            method: 'POST',
            headers: new Headers({
                'Content-type': 'application/json; charset=utf-8',
            }),
            body: JSON.stringify({
                id: categoryId,
            }),
            credentials: 'include',
        };
        fetch(
            `/api/todolists/${getState().todoList.toJS()._id}/delete-category`,
            options
        ).then(() => {
            dispatch(action);
        });
    };
}

export function RenameCategory(id, newName) {
    return (dispatch, getState) => {
        const action = {
            type: constants.RENAME_CATEGORY,
            payload: {
                id,
                newName,
            },
        };
        const options = {
            method: 'POST',
            headers: new Headers({
                'Content-type': 'application/json; charset=utf-8',
            }),
            body: JSON.stringify({
                ...action.payload,
            }),
            credentials: 'include',
        };
        fetch(
            `/api/todolists/${getState().todoList.toJS()._id}/rename-category`,
            options
        ).then(() => {
            dispatch(action);
        });
    };
}

export function AddTodoItem(id, name, parentCategoryId) {
    return (dispatch, getState) => {
        const action = {
            type: constants.ADD_TODO_ITEM,
            payload: {
                id,
                name,
                parentCategoryId,
            },
        };
        const options = {
            method: 'POST',
            headers: new Headers({
                'Content-type': 'application/json; charset=utf-8',
            }),
            body: JSON.stringify({
                ...action.payload,
            }),
            credentials: 'include',
        };
        fetch(
            `/api/todolists/${getState().todoList.toJS()._id}/add-todotask`,
            options
        ).then(() => {
            dispatch(action);
        });
    };
}

export function EditTodoItem(id, isCompleted, newName, newDescription=null) {
    return (dispatch, getState) => {
        const action = {
            type: constants.EDIT_TODO_ITEM,
            payload: {
                id,
                isCompleted,
                newName,
                newDescription,
            },
        };
        const options = {
            method: 'POST',
            headers: new Headers({
                'Content-type': 'application/json; charset=utf-8',
            }),
            body: JSON.stringify({
                ...action.payload,
            }),
            credentials: 'include',
        };
        fetch(
            `/api/todolists/${getState().todoList.toJS()._id}/edit-todotask`,
            options
        ).then(() => {
            dispatch(action);
        });
    };
}

export function MoveTodoItem(itemId, newParentCategory) {
    return (dispatch, getState) => {
        const action = {
            type: constants.MOVE_TODO_ITEM,
            payload: {
                itemId,
                newParentCategory,
            },
        };
        const options = {
            method: 'POST',
            headers: new Headers({
                'Content-type': 'application/json; charset=utf-8',
            }),
            body: JSON.stringify({
                ...action.payload,
            }),
            credentials: 'include',
        };
        fetch(
            `/api/todolists/${getState().todoList.toJS()._id}/move-todotask`,
            options
        ).then(() => {
            dispatch(action);
        });
    };
}

export function Undo() {
    return (dispatch, getState) => {
        const prevState = getState().todoList.toJS().prevState
            ? getState().todoList.toJS().prevState
            : getState().todoList.toJS();
        const options = {
            method: 'POST',
            headers: new Headers({
                'Content-type': 'application/json; charset=utf-8',
            }),
            body: JSON.stringify({
                root: prevState.root,
                categoriesStorage: Object.values(prevState.categoriesStorage),
                itemsStorage: Object.values(prevState.itemsStorage),
            }),
            credentials: 'include',
        };
        fetch(
            `/api/todolists/${getState().todoList.toJS()._id}/undo`,
            options
        ).then(() => {
            dispatch({ type: constants.UNDO });
        });
    };
}

export function Redo() {
    return (dispatch, getState) => {
        const nextState = getState().todoList.toJS().nextState
            ? getState().todoList.toJS().nextState
            : getState().todoList.toJS();
        const options = {
            method: 'POST',
            headers: new Headers({
                'Content-type': 'application/json; charset=utf-8',
            }),
            body: JSON.stringify({
                root: nextState.root,
                categoriesStorage: Object.values(nextState.categoriesStorage),
                itemsStorage: Object.values(nextState.itemsStorage),
            }),
            credentials: 'include',
        };
        fetch(
            `/api/todolists/${getState().todoList.toJS()._id}/redo`,
            options
        ).then(() => {
            dispatch({ type: constants.REDO });
        });
    };
}
