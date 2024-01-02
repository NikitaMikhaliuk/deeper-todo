import React, { Component, useState } from 'react';
import Checkbox from 'material-ui/Checkbox';
import { Link } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { grey400 } from 'material-ui/styles/colors';
import './index.css';

export default function TodoItemEditForm({
    actions,
    filter,
    parentCatLinkPath,
    todoItem,
    todoItemId,
}) {
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
        actions.EditTodoItem(todoItemId, done, name, description);
    }

    function handleCancelEdit() {
        actions.ChoseItemToEdit(null);
    }

    return (
        <div>
            <div className='b-todoitem-edit-form__controls'>
                <Link
                    className='b-todoitem-edit-form__link-button'
                    to={parentCatLinkPath + (filter ? `&filter=${filter}` : '')}
                >
                    <RaisedButton
                        label='Save changes'
                        onClick={handleSubmitItemEdit}
                    />
                </Link>
                <Link
                    className='b-todoitem-edit-form__link-button'
                    to={parentCatLinkPath + (filter ? `&filter=${filter}` : '')}
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
                <Checkbox
                    label='Done'
                    checked={done}
                    onCheck={handleDoneCheckbox}
                />
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
