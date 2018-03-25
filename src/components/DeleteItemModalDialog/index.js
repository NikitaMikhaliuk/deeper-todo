import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default function DeleteItemModalDialog(props) {
  const actions = [
    <FlatButton
      label='Cancel'
      primary={true}
      onClick={props.handleCancelDelete}
    />,
    <FlatButton
      label='Delete'
      secondary={true}
      onClick={props.handleSubmitDelete}
    />,
  ]
  return (
    <Dialog
      title='Confirm Delete'
      actions={actions}
      modal={true}
      open={props.show}>
      {props.text}
  </Dialog>
  )
}

