import React, {Component} from 'react';
import {ListItem} from 'material-ui/List';
import { Link } from 'react-router-dom';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import { nameToUrl } from '../../utils/url-name-transforms';

export default class TodoListItem extends Component {

  handleListItemSelect = () => {
    this.props.handleRequestChange(this.props.id);
  }

  handleEditItem = () => {
    this.props.actions.ChoseItemToEdit(this.props.id)
  }

  handleCompletedCheckboxToggle = (evt, isChecked) => {
    this.props.actions.EditTodoItem(this.props.id, isChecked);
  }

  render() {
    const { todoItem, id, parentCatLinkPath } = this.props;
    const itemLinkPath = parentCatLinkPath + nameToUrl(todoItem.name);    
    return (
      <ListItem
        value={id}
        onClick={this.handleListItemSelect}
        key={id}
        primaryText={ <div style={{maxWidth: '600px', overflow: 'hidden'}}>{todoItem.name}</div>}
        rightIconButton={
          <Link style={{ color: 'inherit', textDecoration: 'none',}} 
            to={!todoItem.completed ? itemLinkPath : parentCatLinkPath}>
            <IconButton
              disabled={todoItem.completed}
              onClick={this.handleEditItem}>
              <ModeEdit />
            </IconButton>
          </Link>          
        }
        leftCheckbox={<Checkbox 
          onCheck={this.handleCompletedCheckboxToggle} 
          checked={todoItem.completed}
          disabled={todoItem.completed}/>}
        />
    );
  }
}