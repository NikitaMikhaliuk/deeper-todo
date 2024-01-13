import { useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import TodoItemsList from '../TodoItemsList/index.jsx';
import TodoItemEditForm from '../TodoItemEditForm/index.jsx';
import './index.css';
import { useAppSelector } from '../../hooks';
import { getCategoryById } from '../../redux/slices/todoCategoriesSlice';

export default function Main({ itemsStorage, actions, rootLinkpath }) {
    const [newItem, setNewItem] = useState('');
    const filter = useAppSelector((state) => state.appView.filter);
    const chosenCategoryId = useAppSelector((state) => state.appView.chosenCategoryId);
    const chosenCategory = useAppSelector((state) =>
        getCategoryById(state, chosenCategoryId)
    );

    function handleAddItemInputChange(e) {
        setNewItem(e.target.value);
    }

    function handleSubmitAddItem() {
        if (newItem) {
            actions.AddTodoItem(crypto.randomUUID(), newItem, chosenCategoryId);
            setNewItem('');
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
                                            value={newItem}
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
                                        itemsToRenderIds={chosenCategory.itemsIds}
                                        parentCatLinkPath={chosenCategory.linkPath}
                                        itemsStorage={itemsStorage}
                                    />
                                </div>
                            ) : null;
                        }}
                    />
                    <Route
                        path={linkPath + '/:itemName'}
                        render={() => {
                            return (
                                <TodoItemEditForm
                                    parentCatLinkPath={linkPath}
                                    actions={actions}
                                />
                            );
                        }}
                    />
                </Switch>
            </Paper>
        </main>
    );
}
