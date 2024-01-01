import React, { Component } from 'react';
import { List } from 'material-ui/List';

import TodoListItem from './TodoListItem.js';

export default class TodoItemsList extends Component {
    render() {
        const {
            itemsStorage,
            itemsToRenderIds,
            actions,
            parentCatLinkPath,
            filter,
            showCompleted,
        } = this.props;
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
}
