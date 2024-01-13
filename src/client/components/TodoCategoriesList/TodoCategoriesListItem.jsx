import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListItem } from 'material-ui/List';
import { grey400 } from 'material-ui/styles/colors';
import SubdirectoryArrowRight from 'material-ui/svg-icons/navigation/subdirectory-arrow-right';
import IconButton from 'material-ui/IconButton';
import OptionsMenu from './OptionsMenu.jsx';
import MyInputForm from '../MyInputForm/index.jsx';
import DeleteItemModalDialog from '../DeleteItemModalDialog/index.jsx';
import { nameToUrl } from '../../utils';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { chooseCategory } from '../../redux/slices/appViewSlice';

const styles = {
    todoCategoryLink: {
        color: 'inherit',
        textDecoration: 'none',
        paddingTop: '11px',
        paddingBottom: '11px',
        display: 'block',
        maxWidth: '400px',
        overflow: 'hidden',
    },
};

export default function TodoCategoriesListItem({
    actions,
    id,
    renderNestedList,
    todoCategoryItem,
}) {
    const filter = useAppSelector((state) => state.appView.filter);
    const chosenItemToEditId = useAppSelector(
        (state) => state.appView.chosenItemToEditId
    );
    const chosenCategoryId = useAppSelector((state) => state.appView.chosenCategoryId);
    const dispatch = useAppDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [showAddNestedCatForm, setShowAddNestedCatForm] = useState(false);
    const [showDeleteModalDialog, setShowDeleteModalDialog] = useState(false);

    function handleListItemSelect() {
        dispatch(chooseCategory(id));
    }

    function handleRenameCat() {
        setIsEditing(true);
    }

    function handleCancelRename() {
        setIsEditing(false);
    }

    function handleSubmitRename(newName) {
        actions.RenameCategory(id, newName);
        setIsEditing(false);
    }

    function handleAddNestedCat() {
        setShowAddNestedCatForm(true);
    }

    function handleSubmitAddNestedCat(catName) {
        const linkPath = todoCategoryItem.linkPath + nameToUrl(catName);
        actions.AddCategory(id, catName, crypto.randomUUID(), linkPath);
        setShowAddNestedCatForm(false);
    }

    function handleCancelAddNestedCat() {
        setShowAddNestedCatForm(false);
    }

    function handleDeleteCat() {
        setShowDeleteModalDialog(true);
    }

    function handleSubmitDelete() {
        actions.DeleteCategory(todoCategoryItem.parentCategoryId, id);
        setShowDeleteModalDialog(false);
    }

    function handleCancelDelete() {
        setShowDeleteModalDialog(false);
    }

    function handleMoveItemInCategory() {
        actions.MoveTodoItem(chosenItemToEditId, id);
    }

    const childToRender = isEditing ? (
        <MyInputForm
            key={id + 'RenameInput'}
            id={`${id}_RenameInput`}
            defaultValue={todoCategoryItem.name}
            handleSubmit={handleSubmitRename}
            handleCancel={handleCancelRename}
        />
    ) : (
        <Link
            onClick={handleListItemSelect}
            style={styles.todoCategoryLink}
            key={id + '_Link'}
            to={todoCategoryItem.linkPath + (filter ? `&filter=${filter}` : '')}
        >
            {todoCategoryItem.name}
        </Link>
    );

    const isSelected = chosenCategoryId === id;
    const nestedArr = renderNestedList(todoCategoryItem.categoriesIds);
    const nestedItemsToRender = showAddNestedCatForm
        ? [
              <ListItem
                  value={id + '_AddNestedInput'}
                  key={id + '_AddNestedInput'}
                  id={id + '_AddNestedInput'}
                  children={
                      <MyInputForm
                          key={id + '_AddNestedInput'}
                          id={id + '_AddNestedInput'}
                          defaultValue={''}
                          handleSubmit={handleSubmitAddNestedCat}
                          handleCancel={handleCancelAddNestedCat}
                      />
                  }
                  innerDivStyle={{
                      backgroundColor: isSelected ? grey400 : 'initial',
                      paddingTop: '5px',
                      paddingBottom: '5px',
                  }}
              />,
          ].concat(nestedArr)
        : nestedArr;
    const leftIconToRender =
        chosenItemToEditId &&
        !todoCategoryItem.itemsIds.includes(chosenItemToEditId) ? (
            <IconButton
                style={{ margin: '0' }}
                onClick={handleMoveItemInCategory}
                tooltip='Move item'
                tooltipPosition='bottom-right'
                disabled={todoCategoryItem.completed}
            >
                <SubdirectoryArrowRight />
            </IconButton>
        ) : (
            OptionsMenu({
                handleRenameCat,
                handleAddNestedCat,
                handleDeleteCat,
                disabled: todoCategoryItem.completed,
            })
        );
    return (
        <ListItem
            value={id}
            key={id}
            disabled={!todoCategoryItem.visible}
            children={[
                childToRender,
                <DeleteItemModalDialog
                    key={id + '_DeleteDialog'}
                    handleSubmitDelete={handleSubmitDelete}
                    handleCancelDelete={handleCancelDelete}
                    show={showDeleteModalDialog}
                    text='Delete this category and all nested items?'
                />,
            ]}
            leftIcon={leftIconToRender}
            initiallyOpen={true}
            primaryTogglesNestedList={false}
            innerDivStyle={{
                backgroundColor: isSelected ? grey400 : 'initial',
                paddingTop: '5px',
                paddingBottom: '5px',
            }}
            nestedItems={nestedItemsToRender}
            nestedListStyle={{ marginLeft: '10px' }}
        />
    );
}
