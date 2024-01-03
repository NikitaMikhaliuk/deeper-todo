import { useState } from 'react';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import Done from 'material-ui/svg-icons/action/done';
import Clear from 'material-ui/svg-icons/content/clear';
import './index.css';

export default function MyInputForm({
    defaultValue,
    handleSubmit,
    handleCancel,
    id,
}) {
    const [value, setValue] = useState(defaultValue);

    function handleInputChange(e) {
        setValue(e.target.value);
    }

    function handleInputSubmit() {
        if (value) {
            handleSubmit(value);
        }
    }

    // TODO: fix buttons layout
    // TODO: check if `id` is needed for TextField
    return (
        <div className='b-catname-input-form'>
            <TextField
                autoFocus
                type='text'
                underlineShow={true}
                id={id}
                value={value}
                onChange={handleInputChange}
            />
            <IconButton onClick={handleInputSubmit}>
                <Done color='green' />
            </IconButton>
            <IconButton onClick={handleCancel}>
                <Clear color='red' />
            </IconButton>
        </div>
    );
}
