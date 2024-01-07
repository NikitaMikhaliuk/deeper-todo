import { ListItem } from 'material-ui/List';
import { Link } from 'react-router-dom';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import { nameToUrl } from '../../utils';

export default function TodoListItem({
    actions,
    todoItem,
    id,
    parentCatLinkPath,
}) {
    function handleEditItem() {
        actions.ChoseItemToEdit(id);
    }

    function handleCompletedCheckboxToggle(e, isChecked) {
        actions.EditTodoItem(id, isChecked);
    }

    const itemLinkPath = parentCatLinkPath + nameToUrl(todoItem.name);
    return (
        <ListItem
            value={id}
            key={id}
            primaryText={
                <div style={{ maxWidth: '600px', overflow: 'hidden' }}>
                    {todoItem.name}
                </div>
            }
            secondaryText={
                todoItem.description ? (
                    <span style={{ maxWidth: '600px', overflow: 'hidden' }}>
                        {todoItem.description}
                    </span>
                ) : (
                    ''
                )
            }
            secondaryTextLines={2}
            rightIconButton={
                <Link
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    to={!todoItem.completed ? itemLinkPath : parentCatLinkPath}
                >
                    <IconButton
                        disabled={todoItem.completed}
                        onClick={handleEditItem}
                    >
                        <ModeEdit />
                    </IconButton>
                </Link>
            }
            leftCheckbox={
                <Checkbox
                    onCheck={handleCompletedCheckboxToggle}
                    checked={todoItem.completed}
                    disabled={todoItem.completed}
                />
            }
        />
    );
}
