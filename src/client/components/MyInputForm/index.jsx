import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import Done from 'material-ui/svg-icons/action/done';
import Clear from 'material-ui/svg-icons/content/clear';
import './index.css';

export default class MyInputForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: this.props.defaultValue,
        };
    }

    handleInputChange = (evt) => {
        this.setState({
            inputValue: evt.target.value,
        });
    };

    handleSubmit = () => {
        if (this.state.inputValue) {
            this.props.handleSubmit(this.state.inputValue);
        }
    };

    handleCancel = () => {
        this.props.handleCancel();
    };

    render() {
        return (
            <div className='b-catname-input-form'>
                <TextField
                    autoFocus
                    type='text'
                    underlineShow={true}
                    id={this.props.id}
                    value={this.state.inputValue}
                    onChange={this.handleInputChange}
                />
                <IconButton onClick={this.handleSubmit}>
                    <Done color='green' />
                </IconButton>
                <IconButton onClick={this.handleCancel}>
                    <Clear color='red' />
                </IconButton>
            </div>
        );
    }
}
