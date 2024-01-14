import { List } from 'material-ui/List';
import TodoListItem from './TodoListItem.jsx';
import { useAppSelector } from '../../hooks';
import { getCategoryById } from '../../redux/slices/todoCategoriesSlice';
import { getItemsByParent } from '../../redux/slices/todoItemsSlice';
import { useMemo } from 'react';

export default function TodoItemsList({ categoryId }) {
    const filter = useAppSelector((state) => state.appView.filter);
    const showCompleted = useAppSelector((state) => state.appView.showCompleted);
    const linkPath = useAppSelector(
        (state) => getCategoryById(state, categoryId).linkPath
    );

    const categoryTodoItems = useAppSelector((state) =>
        getItemsByParent(state, categoryId)
    );

    const filteredTodoItems = useMemo(
        () =>
            (categoryTodoItems || []).filter(
                (item) =>
                    (item.name.includes(filter) || item.description.includes(filter)) &&
                    (showCompleted || !item.completed)
            ),
        [filter, showCompleted, categoryTodoItems]
    );

    return (
        <List>
            {filteredTodoItems.map((item) => (
                <TodoListItem
                    value={item.id} // isn't used by component, can be deleted?
                    key={item.id}
                    todoItem={item}
                    parentCatLinkPath={linkPath}
                />
            ))}
        </List>
    );
}
