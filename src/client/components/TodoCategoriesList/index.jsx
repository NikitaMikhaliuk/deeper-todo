import { useMemo, useState } from 'react';
import { List, makeSelectable } from 'material-ui/List';
import TodoCategoryListItem from './TodoCategoryListItem';
import { useAppSelector } from '../../hooks';
import {
    makeGetCategoriesByIds,
    makeGetCategoryIdsByParent,
} from '../../redux/slices/todoCategoriesSlice';

let SelectableList = makeSelectable(List);

export default function TodoCategoriesList() {
    const showCompleted = useAppSelector((state) => state.appView.showCompleted);
    // possibly needed for SelectableList logic, TODO: check if needed in latest Material UI
    const [selectedId, setSelectedId] = useState(null);

    const getRootCatIds = useMemo(() => makeGetCategoryIdsByParent('root'), []);

    const rootCatIds = useAppSelector(getRootCatIds);

    const getRootCategories = useMemo(
        () => makeGetCategoriesByIds(rootCatIds),
        [rootCatIds]
    );

    const rootCategories = useAppSelector(getRootCategories);

    // possibly needed for SelectableList logic, TODO: check if needed in latest Material UI
    function handleSelectItem(value) {
        setSelectedId(value);
    }

    // TODO: After Redux Toolkit integration,
    // move to separate TodoCategoriesItems component,
    // reused by both this and TodoCategoriesListLitem component
    const renderTodoCategories = (todoCategories) => {
        const categoriesToRender = todoCategories.filter(
            (todoCategory) => showCompleted || todoCategory.visible
        );
        return categoriesToRender.map((todoCategory) => (
            <TodoCategoryListItem
                key={todoCategory.id}
                value={todoCategory.id} // isn't used by component, can be deleted?
                todoCategory={todoCategory}
                renderNestedList={renderTodoCategories}
            />
        ));
    };
    return (
        <SelectableList
            value={selectedId}
            onChange={handleSelectItem} // don't do anything, can be deleted?
        >
            {renderTodoCategories(rootCategories)}
        </SelectableList>
    );
}
