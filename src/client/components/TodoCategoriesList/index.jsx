import { useState } from 'react';
import { List, makeSelectable } from 'material-ui/List';
import TodoCategoriesListItem from './TodoCategoriesListItem.jsx';

let SelectableList = makeSelectable(List);

export default function TodoCategoriesList({
    actions,
    filter,
    root,
    categoriesStorage,
    chosenCategoryId,
    chosenItemToEditId,
    showCompleted,
}) {
    // possibly needed for SelectableList logic, TODO: check if needed in latest Material UI
    const [selectedId, setSelectedId] = useState(null);

    // possibly needed for SelectableList logic, TODO: check if needed in latest Material UI
    function handleSelectItem(value) {
        setSelectedId(value);
    }

    // TODO: After Redux Toolkit integration,
    // move to separate TodoCategoriesItems component,
    // reused by both this and TodoCategoriesListLitem component
    const renderTodoCategories = (todoCatsIds) => {
        const renderCategoryItem = (todoCatId) => {
            return (
                <TodoCategoriesListItem
                    key={todoCatId}
                    value={todoCatId} // isn't used by component, can be deleted?
                    id={todoCatId}
                    chosenCategoryId={chosenCategoryId}
                    todoCategoryItem={categoriesStorage[todoCatId]}
                    renderNestedList={renderTodoCategories}
                    actions={actions}
                    chosenItemToEditId={chosenItemToEditId}
                    filter={filter}
                />
            );
        };
        const categoriesToRender = todoCatsIds.filter(
            (catId) => showCompleted || categoriesStorage[catId].visible
        );
        return categoriesToRender.map(renderCategoryItem);
    };
    return (
        <SelectableList
            value={selectedId}
            onChange={handleSelectItem} // don't do anything, can be deleted?
        >
            {renderTodoCategories(root.categoriesIds)}
        </SelectableList>
    );
}
