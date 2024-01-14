import { useState } from 'react';
import Checkbox from 'material-ui/Checkbox';
import { Link } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { grey400 } from 'material-ui/styles/colors';
import './index.css';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { getItemById } from '../../redux/slices/todoItemsSlice';
import { chooseItemToEdit } from '../../redux/slices/appViewSlice';
import { getCategoryById } from '../../redux/slices/todoCategoriesSlice';
import { editTodoItem } from '../../redux/slices/todoListSlice';

export default function TodoItemEditForm() {
    const filter = useAppSelector((state) => state.appView.filter);
    const chosenItemToEditId = useAppSelector(
        (state) => state.appView.chosenItemToEditId
    );
    const chosenCategoryId = useAppSelector((state) => state.appView.chosenCategoryId);
    const chosenCatLinkPath = useAppSelector(
        (state) => getCategoryById(state, chosenCategoryId).linkPath
    );
    const todoItem = useAppSelector((state) => getItemById(state, chosenItemToEditId));
    const dispatch = useAppDispatch();
    const [name, setName] = useState(todoItem.name);
    const [description, setDescription] = useState(todoItem.description);
    const [done, setDone] = useState(todoItem.completed);

    function handleItemNameInput(e) {
        setName(e.target.value);
    }

    function handleItemDescriptionInput(e) {
        setDescription(e.target.value);
    }

    function handleDoneCheckbox(e, isChecked) {
        setDone(isChecked);
    }

    function handleSubmitItemEdit() {
        dispatch(
            editTodoItem({
                id: chosenItemToEditId,
                changes: {
                    completed: done,
                    name,
                    description,
                },
            })
        );
        dispatch(chooseItemToEdit(''));
    }

    function handleCancelEdit() {
        dispatch(chooseItemToEdit(''));
    }

    return (
        <div>
            <div className='b-todoitem-edit-form__controls'>
                <Link
                    className='b-todoitem-edit-form__link-button'
                    to={chosenCatLinkPath + (filter ? `&filter=${filter}` : '')}
                >
                    <RaisedButton
                        label='Save changes'
                        disabled={!name}
                        onClick={handleSubmitItemEdit}
                    />
                </Link>
                <Link
                    className='b-todoitem-edit-form__link-button'
                    to={chosenCatLinkPath + (filter ? `&filter=${filter}` : '')}
                >
                    <RaisedButton label='Cancel' onClick={handleCancelEdit} />
                </Link>
            </div>
            <div className='b-todoitem-edit-form__inputs-container'>
                <TextField
                    value={name}
                    onChange={handleItemNameInput}
                    style={{
                        border: '1px solid',
                        borderColor: grey400,
                        marginBottom: '10px',
                    }}
                />
                <br />
                <Checkbox label='Done' checked={done} onCheck={handleDoneCheckbox} />
                <br />
                <TextField
                    hintText='Task Description'
                    value={description}
                    onChange={handleItemDescriptionInput}
                    fullWidth={true}
                    multiLine={true}
                    rows={10}
                    style={{ border: '1px solid', borderColor: grey400 }}
                />
            </div>
        </div>
    );
}
