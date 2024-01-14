import mongoose from 'mongoose';
import TodoCategorySchema from './TodoCategorySchema.js';
import TodoTaskSchema from './TodoTaskSchema.js';
import getDBConnection from '../getdbconnection.js';

const TodoListSchema = new mongoose.Schema(
    {
        totalProgress: {
            type: Number,
            required: true,
            default: 0,
        },
        root: {
            linkPath: {
                type: String,
                required: true,
            },
            categoriesIds: [String],
        },
        categoriesStorage: [TodoCategorySchema],
        itemsStorage: [TodoTaskSchema],
    },
    { minimize: false }
);

TodoListSchema.methods.addCategory = function (params) {
    const todoCat = {
        ...params,
        completed: false,
        visible: true,
        itemsIds: [],
        categoriesIds: [],
    };
    this.categoriesStorage.push(todoCat);
    let parentCategory;
    if (todoCat.parentCategoryId !== 'root') {
        parentCategory = this.categoriesStorage.find(
            (category) => category.id === todoCat.parentCategoryId
        );
    } else {
        parentCategory = this.root;
    }
    parentCategory.categoriesIds.push(todoCat.id);
    this.updateTotalProgress();
};

TodoListSchema.methods.deleteEverythingInCategory = function (todoCatId) {
    const todoCatIndex = this.categoriesStorage.findIndex(
        (category) => category.id === todoCatId
    );
    const todoCat = this.categoriesStorage[todoCatIndex];
    todoCat.itemsIds.forEach((itemId) => {
        const itemIndex = this.itemsStorage.findIndex((item) => item.id === itemId);
        this.itemsStorage.splice(itemIndex, 1);
    });
    todoCat.categoriesIds.forEach((id) => {
        this.deleteEverythingInCategory(id);
    });
    this.categoriesStorage.splice(todoCatIndex, 1);
};

TodoListSchema.methods.deleteCategory = function (todoCatId) {
    const todoCat = this.categoriesStorage.find(
        (category) => category.id === todoCatId
    );
    const parentCategory =
        todoCat.parentCategoryId === 'root'
            ? this.root
            : this.categoriesStorage.find(
                  (category) => category.id === todoCat.parentCategoryId
              );
    const todoCatIdIndex = parentCategory.categoriesIds.findIndex(
        (id) => id === todoCatId
    );
    parentCategory.categoriesIds.splice(todoCatIdIndex, 1);
    this.recalculateCategoryProgress(todoCat.parentCategoryId);
    this.deleteEverythingInCategory(todoCatId);
    this.updateTotalProgress();
};

TodoListSchema.methods.rebuildLinkPaths = function (id, parentLinkPath) {
    const todoCat = this.categoriesStorage.find((category) => category.id === id);
    todoCat.linkPath = parentLinkPath + '/' + todoCat.name.split(' ').join('-');
    todoCat.categoriesIds.forEach((catId) => {
        this.rebuildLinkPaths(catId, todoCat.linkPath);
    });
};

TodoListSchema.methods.renameCategory = function (params) {
    const todoCat = this.categoriesStorage.find(
        (category) => category.id === params.id
    );
    const parentLinkPath = todoCat.linkPath.split('/').slice(0, -1).join('/');
    todoCat.name = params.newName;
    this.rebuildLinkPaths(params.id, parentLinkPath);
};

TodoListSchema.methods.updateTotalProgress = function () {
    this.totalProgress =
        this.categoriesStorage.filter((cat) => cat.completed).length /
        this.categoriesStorage.length;
};

TodoListSchema.methods.recalculateCategoryProgress = function (catId) {
    if (catId === 'root') {
        return;
    }
    const todoCat = this.categoriesStorage.find((category) => category.id === catId);
    if (
        todoCat.itemsIds.length &&
        todoCat.categoriesIds.length &&
        todoCat.itemsIds.every(
            (itemId) => this.itemsStorage.find((item) => item.id === itemId).completed
        )
    ) {
        todoCat.completed = true;
        if (
            todoCat.categoriesIds.every(
                (catId) =>
                    !this.categoriesStorage.find((cat) => cat.id === catId).visible
            ) &&
            todoCat.itemsIds.length
        ) {
            todoCat.visible = false;
        }
        this.recalculateCategoryProgress(todoCat.parentCategoryId);
    }
};

TodoListSchema.methods.addTodoitem = function (params) {
    const todoItem = {
        ...params,
        completed: false,
    };
    this.itemsStorage.push(todoItem);
    const parentCategory = this.categoriesStorage.find(
        (category) => category.id === todoItem.parentCategoryId
    );
    parentCategory.itemsIds.push(todoItem.id);
};

TodoListSchema.methods.editTodoItem = function (params) {
    const { id, newName, newDescription, isCompleted } = params;
    const todoItem = this.itemsStorage.find((item) => item.id === id);
    if (newName) {
        todoItem.name = newName;
    }
    if (typeof newDescription === 'string') {
        todoItem.description = newDescription;
    }
    if (isCompleted) {
        todoItem.completed = isCompleted;
        this.recalculateCategoryProgress(todoItem.parentCategoryId);
        this.updateTotalProgress();
    }
};

TodoListSchema.methods.moveTodoItem = function (params) {
    const todoItem = this.itemsStorage.find((item) => item.id === params.itemId);
    const oldTodoCatIndex = this.categoriesStorage.findIndex(
        (category) => category.id === todoItem.parentCategoryId
    );
    const oldTodoCat = this.categoriesStorage[oldTodoCatIndex];

    const todoItemParentCatIndex = oldTodoCat.itemsIds.findIndex(
        (item) => item.id === params.itemId
    );
    oldTodoCat.itemsIds.splice(todoItemParentCatIndex, 1);
    const newTodoCat = this.categoriesStorage.find(
        (category) => category.id === params.newParentCategory
    );
    newTodoCat.itemsIds.push(params.itemId);
    this.recalculateCategoryProgress(todoItem.parentCategoryId);
    todoItem.parentCategoryId = params.newParentCategory;
    this.updateTotalProgress();
};

TodoListSchema.methods.updateTodoList = function (params) {
    this.root = params.root;
    this.categoriesStorage = params.categoriesStorage;
    this.itemsStorage = params.itemsStorage;
    this.updateTotalProgress();
};

TodoListSchema.set('autoIndex', false);
const TodoList = getDBConnection('TodoList', TodoListSchema);

export default TodoList;
