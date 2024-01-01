import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListItem } from 'material-ui/List';
import { grey400 } from 'material-ui/styles/colors';
import SubdirectoryArrowRight from 'material-ui/svg-icons/navigation/subdirectory-arrow-right';
import IconButton from 'material-ui/IconButton';
import OptionsMenu from './OptionsMenu.js';
import MyInputForm from '../MyInputForm/index.js';
import DeleteItemModalDialog from '../DeleteItemModalDialog/index.js';
import uid from 'uid';
import { nameToUrl } from '../../utils/url-name-transforms';

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

export default class TodoCategoriesListItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditing: false,
            showAddNestedCatForm: false,
            showDeleteModalDialog: false,
        };
    }
    handleListItemSelect = () => {
        const { id } = this.props;
        this.props.handleRequestChange(id);
        this.props.actions.ChoseCategory(id);
    };

    handleRenameCat = () => {
        this.setState({
            isEditing: true,
        });
    };

    handleCancelRename = () => {
        this.setState({
            isEditing: false,
        });
    };

    handleSubmitRename = (newName) => {
        this.props.actions.RenameCategory(this.props.id, newName);
        this.setState({
            isEditing: false,
        });
    };

    handleAddNestedCat = () => {
        this.setState({
            showAddNestedCatForm: true,
        });
    };

    handleSubmitAddNestedCat = (catName) => {
        const linkPath =
            this.props.todoCategoryItem.linkPath + nameToUrl(catName);
        this.props.actions.AddCategory(this.props.id, catName, uid(), linkPath);
        this.setState({
            showAddNestedCatForm: false,
        });
    };

    handleCancelAddNestedCat = () => {
        this.setState({
            showAddNestedCatForm: false,
        });
    };

    handleDeleteCat = () => {
        this.setState({
            showDeleteModalDialog: true,
        });
    };

    handleSubmitDelete = () => {
        const { id, todoCategoryItem } = this.props;
        this.props.actions.DeleteCategory(
            todoCategoryItem.parentCategoryId,
            id
        );
        this.setState({
            showDeleteModalDialog: false,
        });
    };

    handleCancelDelete = () => {
        this.setState({
            showDeleteModalDialog: false,
        });
    };

    handleMoveItemInCategory = () => {
        this.props.actions.MoveTodoItem(
            this.props.chosenItemToEditId,
            this.props.id
        );
    };

    render() {
        const {
            todoCategoryItem,
            renderNestedList,
            selectedIndex,
            id,
            chosenItemToEditId,
        } = this.props;
        const isSelected = selectedIndex === id;
        const {
            handleRenameCat,
            handleAddNestedCat,
            handleDeleteCat,
            handleSubmitDelete,
            handleCancelDelete,
        } = this;
        const { showDeleteModalDialog, isEditing, showAddNestedCatForm } =
            this.state;
        const childToRender = isEditing ? (
            <MyInputForm
                key={id + 'RenameInput'}
                id={`${id}_RenameInput`}
                defaultValue={todoCategoryItem.name}
                handleSubmit={this.handleSubmitRename}
                handleCancel={this.handleCancelRename}
            />
        ) : (
            <Link
                onClick={this.handleListItemSelect}
                style={styles.todoCategoryLink}
                key={id + '_Link'}
                to={
                    todoCategoryItem.linkPath +
                    (this.props.filter ? `&filter=${this.props.filter}` : '')
                }
            >
                {todoCategoryItem.name}
            </Link>
        );
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
                              handleSubmit={this.handleSubmitAddNestedCat}
                              handleCancel={this.handleCancelAddNestedCat}
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
                    onClick={this.handleMoveItemInCategory}
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
}
