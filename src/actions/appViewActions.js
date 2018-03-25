import * as constants from '../constants';

export function ChoseCategory(categoryId) {
  return {
    type: constants.CHOSE_CATEGORY,
    payload: {
      categoryId
    }
  };
}

export function ChoseItemToEdit(itemId) {
  return {
    type: constants.CHOSE_TODO_ITEM_TO_EDIT,
    payload: {
      itemId
    }
  };
}

export function ApplyFilter(filter) {
  return {
    type: constants.APPLY_FILTER,
    payload: {
      filter
    }
  };
}

export function ToggleShowCompleted(showCompleted) {
  return {
    type: constants.TOGGLE_SHOW_COMPLETED,
    payload: {
      showCompleted
    }
  };
}