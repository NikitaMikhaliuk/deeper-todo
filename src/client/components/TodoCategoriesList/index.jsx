import { useState } from 'react';
import { List, makeSelectable } from 'material-ui/List';
import TodoCategoriesListItem from './TodoCategoriesListItem.jsx';
import { useAppSelector } from '../../hooks';

let SelectableList = makeSelectable(List);

export default function TodoCategoriesList({ actions, root, categoriesStorage }) {
    const showCompleted = useAppSelector((state) => state.appView.showCompleted);
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
                    todoCategoryItem={categoriesStorage[todoCatId]}
                    renderNestedList={renderTodoCategories}
                    actions={actions}
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
