import { ListItem } from 'material-ui/List';
import { Link } from 'react-router-dom';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import { nameToUrl } from '../../utils';
import { chooseItemToEdit } from '../../redux/slices/appViewSlice';
import { useAppDispatch } from '../../hooks';
import { editTodoItem } from '../../redux/slices/todoListSlice';

export default function TodoListItem({ todoItem, parentCatLinkPath }) {
    const dispatch = useAppDispatch();

    const { id, name, description, completed } = todoItem;
    function handleEditItem() {
        dispatch(chooseItemToEdit(id));
    }

    function handleCompletedCheckboxToggle() {
        dispatch(
            editTodoItem({
                id,
                changes: {
                    completed: true,
                },
            })
        );
    }

    const itemLinkPath = parentCatLinkPath + nameToUrl(name);
    return (
        <ListItem
            value={id}
            key={id}
            primaryText={
                <div style={{ maxWidth: '600px', overflow: 'hidden' }}>{name}</div>
            }
            secondaryText={
                description ? (
                    <span style={{ maxWidth: '600px', overflow: 'hidden' }}>
                        {description}
                    </span>
                ) : (
                    ''
                )
            }
            secondaryTextLines={2}
            rightIconButton={
                <Link
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    to={!completed ? itemLinkPath : parentCatLinkPath}
                >
                    <IconButton disabled={completed} onClick={handleEditItem}>
                        <ModeEdit />
                    </IconButton>
                </Link>
            }
            leftCheckbox={
                <Checkbox
                    onCheck={handleCompletedCheckboxToggle}
                    checked={completed}
                    disabled={completed}
                />
            }
        />
    );
}
