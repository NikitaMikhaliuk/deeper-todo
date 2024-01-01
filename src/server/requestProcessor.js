import User from './models/UserModel.js';
import TodoList from './models/TodoListModel.js';

export function getUser(username, callback) {
    User.findOne({ username }, function (err, user) {
        if (err) {
            callback(err);
        } else {
            callback(null, user);
        }
    });
}

export function createUser(username, password, callback) {
    const todolist = new TodoList({
        root: {
            parentCategoryId: '',
            linkPath: '/app/' + username + '/categories',
            categoriesIds: [],
        },
        categoriesStorage: [],
        itemsStorage: [],
    });

    User.createUser(username, password, todolist._id, () => {
        todolist.save(function (err) {
            if (err) {
                console.log(err);
                return;
            }
        });
        callback();
    });
}

export function getTodoList(id, callback) {
    TodoList.findById(id, function (err, todoList) {
        if (err) {
            callback(err);
        } else {
            callback(null, todoList);
        }
    });
}

function saveTodoList(todolist) {
    todolist.save(function (err) {
        if (err) {
            console.log(err);
            return;
        }
    });
}

export function addCategory(todolist, params) {
    todolist.addCategory(params.todoCat);
    saveTodoList(todolist);
}

export function deleteCategory(todolist, params) {
    todolist.deleteCategory(params.id);
    saveTodoList(todolist);
}

export function renameCategory(todolist, params) {
    todolist.renameCategory(params);
    saveTodoList(todolist);
}

export function addTodoTask(todolist, params) {
    todolist.addTodoitem(params);
    saveTodoList(todolist);
}

export function editTodoTask(todolist, params) {
    todolist.editTodoItem(params);
    saveTodoList(todolist);
}

export function moveTodoTask(todolist, params) {
    todolist.moveTodoItem(params);
    saveTodoList(todolist);
}

export function undo(todolist, params) {
    todolist.updateTodoList(params);
    saveTodoList(todolist);
}

export function redo(todolist, params) {
    todolist.updateTodoList(params);
    saveTodoList(todolist);
}
