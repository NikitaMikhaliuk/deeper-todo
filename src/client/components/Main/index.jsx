import { useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import TodoItemsList from '../TodoItemsList/index.jsx';
import TodoItemEditForm from '../TodoItemEditForm/index.jsx';
import './index.css';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { getCategoryById } from '../../redux/slices/todoCategoriesSlice';
import { addTodoItem } from '../../redux/slices/todoListSlice';

export default function Main() {
    const [newItem, setNewItem] = useState('');
    const filter = useAppSelector((state) => state.appView.filter);
    const chosenCategoryId = useAppSelector((state) => state.appView.chosenCategoryId);
    const chosenCategory = useAppSelector((state) =>
        getCategoryById(state, chosenCategoryId)
    );
    const dispatch = useAppDispatch();

    function handleAddItemInputChange(e) {
        setNewItem(e.target.value);
    }

    function handleSubmitAddItem() {
        if (newItem) {
            dispatch(
                addTodoItem({
                    id: crypto.randomUUID(),
                    name: newItem,
                    description: '',
                    completed: false,
                    parentCategoryId: chosenCategoryId,
                })
            );
            setNewItem('');
        }
    }
    if (chosenCategory) {
        const { completed: catCompleted, linkPath: catLinkPath } = chosenCategory;

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
                            path={catLinkPath + (filter ? `&filter=${filter}` : '')}
                            render={() => (
                                <>
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
                                            disabled={catCompleted}
                                        />
                                    </div>
                                    <TodoItemsList categoryId={chosenCategoryId} />
                                </>
                            )}
                        />
                        <Route
                            path={catLinkPath + '/:itemName'}
                            render={() => <TodoItemEditForm />}
                        />
                    </Switch>
                </Paper>
            </main>
        );
    }
}
