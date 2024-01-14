import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListItem } from 'material-ui/List';
import { grey400 } from 'material-ui/styles/colors';
import SubdirectoryArrowRight from 'material-ui/svg-icons/navigation/subdirectory-arrow-right';
import IconButton from 'material-ui/IconButton';
import OptionsMenu from './OptionsMenu';
import MyInputForm from '../MyInputForm';
import DeleteItemModalDialog from '../DeleteItemModalDialog';
import { nameToUrl } from '../../utils';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { chooseCategory } from '../../redux/slices/appViewSlice';
import {
    makeGetCategoriesByIds,
    makeGetCategoryIdsByParent,
} from '../../redux/slices/todoCategoriesSlice';
import {
    addTodoCategory,
    deleteTodoCategory,
    moveTodoItem,
    renameTodoCategory,
} from '../../redux/slices/todoListSlice';

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

export default function TodoCategoryListItem({ todoCategory, renderNestedList }) {
    const filter = useAppSelector((state) => state.appView.filter);
    const chosenItemToEditId = useAppSelector(
        (state) => state.appView.chosenItemToEditId
    );
    const chosenCategoryId = useAppSelector((state) => state.appView.chosenCategoryId);
    const dispatch = useAppDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [showAddNestedCatForm, setShowAddNestedCatForm] = useState(false);
    const [showDeleteModalDialog, setShowDeleteModalDialog] = useState(false);
    const { id, name, parentCategoryId, linkPath, completed, visible } = todoCategory;

    const getNestedCatIds = useMemo(() => makeGetCategoryIdsByParent(id), [id]);
    const nestedCatIds = useAppSelector(getNestedCatIds);

    const getNestedCategories = useMemo(
        () => makeGetCategoriesByIds(nestedCatIds),
        [nestedCatIds]
    );

    const nestedCategories = useAppSelector(getNestedCategories);

    const catItemsIds =
        useAppSelector((state) => state.todoItems.idsGroupedByParent[id]) || [];

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
        dispatch(
            renameTodoCategory({
                id,
                changes: {
                    name: newName,
                },
            })
        );
        setIsEditing(false);
    }

    function handleAddNestedCat() {
        setShowAddNestedCatForm(true);
    }

    function handleSubmitAddNestedCat(catName) {
        const newCatLinkPath = linkPath + nameToUrl(catName);
        dispatch(
            addTodoCategory({
                id: crypto.randomUUID(),
                name: catName,
                completed: false,
                visible: true,
                linkPath: newCatLinkPath,
                parentCategoryId: id,
            })
        );
        setShowAddNestedCatForm(false);
    }

    function handleCancelAddNestedCat() {
        setShowAddNestedCatForm(false);
    }

    function handleDeleteCat() {
        setShowDeleteModalDialog(true);
    }

    function handleSubmitDelete() {
        dispatch(deleteTodoCategory(id));
        setShowDeleteModalDialog(false);
    }

    function handleCancelDelete() {
        setShowDeleteModalDialog(false);
    }

    function handleMoveItemInCategory() {
        dispatch(
            moveTodoItem({
                id: chosenItemToEditId,
                changes: {
                    parentCategoryId: id,
                },
            })
        );
    }

    const childToRender = isEditing ? (
        <MyInputForm
            key={id + 'RenameInput'}
            id={`${id}_RenameInput`}
            defaultValue={name}
            handleSubmit={handleSubmitRename}
            handleCancel={handleCancelRename}
        />
    ) : (
        <Link
            onClick={handleListItemSelect}
            style={styles.todoCategoryLink}
            key={id + '_Link'}
            to={linkPath + (filter ? `&filter=${filter}` : '')}
        >
            {name}
        </Link>
    );

    const isSelected = chosenCategoryId === id;
    const nestedArr = renderNestedList(nestedCategories);
    const nestedItemsToRender = showAddNestedCatForm
        ? [
              <ListItem
                  value={id + '_AddNestedInput'}
                  key={id + '_AddNestedInput'}
                  id={id + '_AddNestedInput'}
                  innerDivStyle={{
                      backgroundColor: isSelected ? grey400 : 'initial',
                      paddingTop: '5px',
                      paddingBottom: '5px',
                  }}
              >
                  <MyInputForm
                      key={id + '_AddNestedInput'}
                      id={id + '_AddNestedInput'}
                      defaultValue={''}
                      handleSubmit={handleSubmitAddNestedCat}
                      handleCancel={handleCancelAddNestedCat}
                  />
              </ListItem>,
          ].concat(nestedArr)
        : nestedArr;
    const leftIconToRender =
        chosenItemToEditId && !catItemsIds.includes(chosenItemToEditId) ? (
            <IconButton
                style={{ margin: '0' }}
                onClick={handleMoveItemInCategory}
                tooltip='Move item'
                tooltipPosition='bottom-right'
                disabled={completed}
            >
                <SubdirectoryArrowRight />
            </IconButton>
        ) : (
            OptionsMenu({
                handleRenameCat,
                handleAddNestedCat,
                handleDeleteCat,
                disabled: completed,
            })
        );

    const childrenToRender = [
        childToRender,
        <DeleteItemModalDialog
            key={id + '_DeleteDialog'}
            handleSubmitDelete={handleSubmitDelete}
            handleCancelDelete={handleCancelDelete}
            show={showDeleteModalDialog}
            text='Delete this category and all nested items?'
        />,
    ];
    return (
        <ListItem
            value={id}
            key={id}
            disabled={!visible}
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
        >
            {childrenToRender}
        </ListItem>
    );
}
