import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default function DeleteItemModalDialog({
    handleCancelDelete,
    handleSubmitDelete,
    show,
    text,
}) {
    const actions = [
        <FlatButton
            label='Cancel'
            primary={true}
            onClick={handleCancelDelete}
        />,
        <FlatButton
            label='Delete'
            secondary={true}
            onClick={handleSubmitDelete}
        />,
    ];
    return (
        <Dialog
            title='Confirm Delete'
            actions={actions}
            modal={true}
            open={show}
        >
            {text}
        </Dialog>
    );
}
