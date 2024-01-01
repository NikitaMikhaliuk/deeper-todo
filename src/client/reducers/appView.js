import { fromJS } from 'immutable';
import * as constants from '../constants';

function handleCategoryDelete(params, state) {
    const chosenCategoryId = state.get('chosenCategoryId');
    if (chosenCategoryId === params.categoryId) {
        return state.set('chosenCategoryId', null);
    }
    return state;
}

export default function appReducer(state = fromJS({}), action) {
    switch (action.type) {
        case constants.CHOSE_CATEGORY:
            return state.set('chosenCategoryId', action.payload.categoryId);

        case constants.CHOSE_TODO_ITEM_TO_EDIT:
            return state.set('chosenItemToEditId', action.payload.itemId);

        case constants.DELETE_CATEGORY:
            return handleCategoryDelete(action.payload, state);

        case constants.EDIT_TODO_ITEM:
            return state.set('chosenItemToEditId', null);

        case constants.APPLY_FILTER:
            return state.set('filter', action.payload.filter);

        case constants.TOGGLE_SHOW_COMPLETED:
            return state.set('showCompleted', action.payload.showCompleted);

        default:
            return state;
    }
}
