const User = require('./models/UserModel');
const TodoList = require('./models/TodoListModel');

exports.getUser = function (username, callback) {
    User.findOne({ username }, function (err, user) {
        if (err) {
            callback(err);
        } else {
            callback(null, user);
        }
    });
};

exports.createUser = function (username, password, callback) {
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
};

exports.getTodoList = function (id, callback) {
    TodoList.findById(id, function (err, todoList) {
        if (err) {
            callback(err);
        } else {
            callback(null, todoList);
        }
    });
};

function saveTodoList(todolist) {
    todolist.save(function (err) {
        if (err) {
            console.log(err);
            return;
        }
    });
}

exports.addCategory = function (todolist, params) {
    todolist.addCategory(params.todoCat);
    saveTodoList(todolist);
};

exports.deleteCategory = function (todolist, params) {
    todolist.deleteCategory(params.id);
    saveTodoList(todolist);
};

exports.renameCategory = function (todolist, params) {
    todolist.renameCategory(params);
    saveTodoList(todolist);
};

exports.addTodoTask = function (todolist, params) {
    todolist.addTodoitem(params);
    saveTodoList(todolist);
};

exports.editTodoTask = function (todolist, params) {
    todolist.editTodoItem(params);
    saveTodoList(todolist);
};

exports.moveTodoTask = function (todolist, params) {
    todolist.moveTodoItem(params);
    saveTodoList(todolist);
};

exports.undo = function (todolist, params) {
    todolist.updateTodolist(params);
    saveTodoList(todolist);
};

exports.redo = function (todolist, params) {
    todolist.updateTodolist(params);
    saveTodoList(todolist);
};
