import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

export default function TodoCategoriesMenu({
    categories,
    choosenCategoryId,
    onChange,
}) {
    return (
        <DropDownMenu
            value={choosenCategoryId}
            onChange={(e, index, value) => {
                onChange(value);
            }}
        >
            {categories.map((category) => (
                <MenuItem
                    key={category.id}
                    value={category.id}
                    primaryText={category.name}
                ></MenuItem>
            ))}
        </DropDownMenu>
    );
}
