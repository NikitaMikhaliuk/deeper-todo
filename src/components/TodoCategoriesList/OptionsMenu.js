import React from 'react';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';




export default function OptionsMenu(props) {
  const iconButtonElement = (
    <IconButton
      touch={true}
      tooltip='Options'
      tooltipPosition='bottom-right'
      disabled={props.disabled}>
      <MoreVertIcon />
    </IconButton>
  );
  return (
    <IconMenu iconButtonElement={iconButtonElement}
      style={{margin: '0'}}>
    <MenuItem onClick={props.handleRenameCat}>Rename</MenuItem>
    <MenuItem onClick={props.handleDeleteCat}>Delete</MenuItem>
    <MenuItem onClick={props.handleAddNestedCat}>Add Nested Category</MenuItem>    
  </IconMenu>
  );
}
