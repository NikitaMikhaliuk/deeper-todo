import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';

export default function OptionsMenu({
    disabled,
    handleAddNestedCat,
    handleDeleteCat,
    handleRenameCat,
}) {
    const iconButtonElement = (
        <IconButton
            touch={true}
            tooltip='Options'
            tooltipPosition='bottom-right'
            disabled={disabled}
        >
            <MoreVertIcon />
        </IconButton>
    );
    return (
        <IconMenu iconButtonElement={iconButtonElement} style={{ margin: '0' }}>
            <MenuItem onClick={handleRenameCat}>Rename</MenuItem>
            <MenuItem onClick={handleDeleteCat}>Delete</MenuItem>
            <MenuItem onClick={handleAddNestedCat}>
                Add Nested Category
            </MenuItem>
        </IconMenu>
    );
}
