import { List } from 'material-ui/List';
import TodoListItem from './TodoListItem.jsx';
import { useAppSelector } from '../../hooks';

export default function TodoItemsList({
    itemsStorage,
    itemsToRenderIds,
    actions,
    parentCatLinkPath,
}) {
    const filter = useAppSelector((state) => state.appView.filter);
    const showCompleted = useAppSelector((state) => state.appView.showCompleted);

    const filteredItemsToRenderIds = itemsToRenderIds.filter(
        (itemId) =>
            itemsStorage[itemId].name.includes(filter) &&
            (showCompleted || !itemsStorage[itemId].completed)
    );
    const renderTodoList = (todoItemId) => {
        return (
            <TodoListItem
                value={todoItemId} // isn't used by component, can be deleted?
                key={todoItemId}
                todoItem={itemsStorage[todoItemId]}
                id={todoItemId}
                actions={actions}
                parentCatLinkPath={parentCatLinkPath}
            />
        );
    };
    return <List>{filteredItemsToRenderIds.map(renderTodoList)}</List>;
}
