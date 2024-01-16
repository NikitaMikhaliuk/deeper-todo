import { useMemo, useState } from 'react';
import Checkbox from 'material-ui/Checkbox';
import { Link } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import TodoCategoriesMenu from './TodoCategoriesMenu';
import { grey400 } from 'material-ui/styles/colors';
import './index.css';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { getItemById } from '../../redux/slices/todoItemsSlice';
import { chooseItemToEdit } from '../../redux/slices/appViewSlice';
import {
    getAllCategories,
    getCategoryById,
} from '../../redux/slices/todoCategoriesSlice';
import { editTodoItem, moveTodoItem } from '../../redux/slices/todoListSlice';

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
    const categories = useAppSelector((state) => getAllCategories(state));
    const visibleCategories = useMemo(
        () => categories.filter((category) => category.visible),
        [categories]
    );
    const dispatch = useAppDispatch();
    const { name, description, completed, parentCategoryId } = todoItem;
    const [newName, setName] = useState(name);
    const [newDescription, setDescription] = useState(description);
    const [done, setDone] = useState(completed);
    const [newParrentCategoryId, setNewParrentCategoryId] = useState(parentCategoryId);

    function handleItemNameInput(e) {
        setName(e.target.value);
    }

    function handleItemDescriptionInput(e) {
        setDescription(e.target.value);
    }

    function handleDoneCheckbox(e, isChecked) {
        setDone(isChecked);
    }

    function handleCategoryChange(categoryId) {
        setNewParrentCategoryId(categoryId);
    }

    function handleSubmitItemEdit() {
        const changes = {};
        if (newName !== name) {
            changes.name = newName;
        }
        if (newDescription !== description) {
            changes.description = newDescription;
        }
        if (done !== completed) {
            changes.completed = done;
        }
        dispatch(
            editTodoItem({
                id: chosenItemToEditId,
                changes,
            })
        );
        if (newParrentCategoryId !== parentCategoryId) {
            dispatch(
                moveTodoItem({
                    id: chosenItemToEditId,
                    changes: {
                        parentCategoryId: newParrentCategoryId,
                    },
                })
            );
        }
        dispatch(chooseItemToEdit(''));
    }

    function handleCancelEdit() {
        dispatch(chooseItemToEdit(''));
    }

    return (
        <>
            <div className='b-todoitem-edit-form__inputs-container'>
                <div className='b-todoitem-edit-form__primary-inputs-container'>
                    <TextField
                        value={newName}
                        onChange={handleItemNameInput}
                        style={{
                            border: '1px solid',
                            borderColor: grey400,
                            marginBottom: '10px',
                        }}
                    />
                    <TodoCategoriesMenu
                        categories={visibleCategories}
                        choosenCategoryId={newParrentCategoryId}
                        onChange={handleCategoryChange}
                    />
                </div>
                <br />
                <Checkbox label='Done' checked={done} onCheck={handleDoneCheckbox} />
                <br />
                <TextField
                    hintText='Task Description'
                    value={newDescription}
                    onChange={handleItemDescriptionInput}
                    fullWidth={true}
                    multiLine={true}
                    rows={10}
                    style={{ border: '1px solid', borderColor: grey400 }}
                />
            </div>
            <div className='b-todoitem-edit-form__controls'>
                <Link
                    className='b-todoitem-edit-form__link-button'
                    to={chosenCatLinkPath + (filter ? `&filter=${filter}` : '')}
                >
                    <RaisedButton
                        label='Save changes'
                        disabled={!newName}
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
        </>
    );
}
