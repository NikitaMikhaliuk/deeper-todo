import { List } from 'material-ui/List';
import TodoListItem from './TodoListItem.jsx';

export default function TodoItemsList({
    itemsStorage,
    itemsToRenderIds,
    actions,
    parentCatLinkPath,
    filter,
    showCompleted,
}) {
    const filteredItemsToRenderIds = itemsToRenderIds.filter(
        (itemId) =>
            itemsStorage[itemId].name.includes(filter) &&
            (showCompleted || !itemsStorage[itemId].completed)
    );
    const renderTodoList = (todoItemId) => {
        return (
            <TodoListItem
                value={todoItemId}
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
