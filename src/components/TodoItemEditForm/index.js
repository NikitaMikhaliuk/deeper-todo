import React, {Component} from 'react';
import Checkbox from 'material-ui/Checkbox';
import { Link } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { grey400 } from 'material-ui/styles/colors';
import './index.css';

// const styles = {
//   linkstyle: {
//     margin: '20px'
//   },
// }


export default class TodoItemEditForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemNameInputValue: this.props.todoItem.name,
      itemDescriptionInputValue: this.props.todoItem.description,
      isDone: this.props.todoItem.completed
    };
  }

  handleItemNameInput = (evt) => {
    this.setState({
      itemNameInputValue: evt.target.value
    });
  }

  handleItemDescriptionInput = (evt) => {
    this.setState({
      itemDescriptionInputValue: evt.target.value
    });
  }

  handleDoneCheckbox = (evt, isChecked) => {
    this.setState({
      isDone: isChecked
    })
  }

  handleSubmitItemEdit = () => {
    this.props.actions.EditTodoItem(
      this.props.todoItemId,
      this.state.isDone,
      this.state.itemNameInputValue,
      this.state.itemDescriptionInputValue
    );
  }

  handleCancelEdit = () => {
    this.props.actions.ChoseItemToEdit(null);
  }

  render() {
    return (
      <div>
        <div className='b-todoitem-edit-form__controls'>
          <Link 
            className='b-todoitem-edit-form__link-button'
            to={this.props.parentCatLinkPath + (this.props.filter ? `&filter=${this.props.filter}` : '')}>
            <RaisedButton
              label='Save changes'
              onClick={this.handleSubmitItemEdit} />
          </Link>
          <Link 
            className='b-todoitem-edit-form__link-button'
            to={this.props.parentCatLinkPath + (this.props.filter ? `&filter=${this.props.filter}` : '')}>
            <RaisedButton
              label='Cancel'
              onClick={this.handleCancelEdit} />
          </Link>
        </div>
        <div className='b-todoitem-edit-form__inputs-container'>
          <TextField
          value={this.state.itemNameInputValue}
          onChange={this.handleItemNameInput}
          style={{border: '1px solid', borderColor: grey400, marginBottom: '10px'}} />
          <br />
          <Checkbox
            label='Done' 
            checked={this.state.isDone}
            onCheck={this.handleDoneCheckbox}/>
          <br />
          <TextField
            value={this.state.itemDescriptionInputValue}
            onChange={this.handleItemDescriptionInput}
            fullWidth={true}
            multiLine={true}
            rows={10}
            style={{border: '1px solid', borderColor: grey400,}} />
        </div>
      </div>
    );
  }
}