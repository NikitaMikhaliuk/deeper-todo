import { useState } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import TodoItemsList from '../TodoItemsList/index.jsx';
import TodoItemEditForm from '../TodoItemEditForm/index.jsx';
import './index.css';

export default function Main({
    chosenCategory,
    chosenCategoryId,
    chosenItemToEditId,
    itemsStorage,
    actions,
    filter,
    showCompleted,
    rootLinkpath,
}) {
    const [addItem, setAddItem] = useState('');

    function handleAddItemInputChange(e) {
        setAddItem(e.target.value);
    }

    function handleSubmitAddItem() {
        if (addItem) {
            actions.AddTodoItem(crypto.randomUUID(), addItem, chosenCategoryId);
            setAddItem('');
        }
    }

    const linkPath = chosenCategory ? chosenCategory.linkPath : '/';
    return (
        <main className='b-main'>
            <Paper
                zDepth={1}
                style={{
                    width: '100%',
                    height: '100%',
                }}
            >
                <Switch>
                    <Route
                        exact
                        path={linkPath + (filter ? `&filter=${filter}` : '')}
                        render={() => {
                            return chosenCategory ? (
                                <div>
                                    <div className='b-main__add-task-form'>
                                        <TextField
                                            onChange={handleAddItemInputChange}
                                            value={addItem}
                                            type='text'
                                            hintText='Enter TodoItem Title'
                                            style={{ margin: '5px' }}
                                            id={'2'}
                                        />
                                        <FlatButton
                                            label='Add'
                                            onClick={handleSubmitAddItem}
                                            disabled={chosenCategory.completed}
                                        />
                                    </div>
                                    <TodoItemsList
                                        actions={actions}
                                        itemsToRenderIds={
                                            chosenCategory.itemsIds
                                        }
                                        parentCatLinkPath={
                                            chosenCategory.linkPath
                                        }
                                        itemsStorage={itemsStorage}
                                        filter={filter}
                                        showCompleted={showCompleted}
                                    />
                                </div>
                            ) : (
                                <Redirect to={rootLinkpath} />
                            );
                        }}
                    />
                    <Route
                        path={linkPath + '/:itemName'}
                        render={() => {
                            return (
                                <TodoItemEditForm
                                    todoItem={itemsStorage[chosenItemToEditId]}
                                    todoItemId={chosenItemToEditId}
                                    parentCatLinkPath={linkPath}
                                    actions={actions}
                                    filter={filter}
                                />
                            );
                        }}
                    />
                    <Redirect to={rootLinkpath} />
                </Switch>
            </Paper>
        </main>
    );
}
