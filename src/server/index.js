import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from './authentication';
import {
    getUser,
    createUser,
    getTodoList,
    addCategory,
    deleteCategory,
    renameCategory,
    addTodoTask,
    editTodoTask,
    moveTodoTask,
    undo,
    redo,
} from './requestProcessor';
import logger from './logger';
import favicon from 'serve-favicon';
import path from 'path';

const app = express();

app.use(favicon(path.join(__dirname, '../', '/dist/favicon.ico')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
    session({
        secret: 'SECRET',
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

function login(req, res, next) {
    logger.info('login request');
    if (
        !req.body.login.match(/\w{5,}/) ||
        !req.body.password.match(
            /(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/
        )
    ) {
        res.statusCode = 401;
        res.statusMessage = 'Incorrect Login or Password';
        res.end();
    } else {
        passport.authenticate('local', function (err, user) {
            if (err) {
                res.statusCode = 502;
                res.end('Sorry, unable to login');
            }
            if (!user) {
                res.statusCode = 401;
                res.statusMessage = 'Incorrect Login or Password';
                res.end();
            } else {
                req.logIn(user, function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.json({ redirect: '/app/' + user.username });
                    res.end();
                });
            }
        })(req, res, next);
    }
}

app.post('/login', login);

app.post('/register', function (req, res, next) {
    if (
        !req.body.login.match(/\w{5,}/) ||
        !req.body.password.match(
            /(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/
        )
    ) {
        res.statusCode = 401;
        res.end('Incorrect Login or Password');
    } else {
        getUser(req.body.login, (err, user) => {
            if (user) {
                res.statusCode = 401;
                res.statusMessage = 'User is alredy exists';
                res.end();
            } else {
                createUser(req.body.login, req.body.password, () => {
                    login(req, res, next);
                });
            }
        });
    }
});

app.get('/app/:username*', function (req, res) {
    if (req.isAuthenticated() && req.user.username === req.params.username) {
        res.sendFile(path.join(__dirname, '../', '/dist/index.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/', function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/app/' + req.user.username);
    } else {
        res.sendFile(path.join(__dirname, '../', '/dist/authentication.html'));
    }
});

app.use('/api/users/:username*', function (req, res, next) {
    if (req.isAuthenticated() && req.user.username === req.params.username) {
        next();
    } else {
        res.statusCode = 403;
        res.statusMessage = 'Unauthorized user data request! Access denied';
        res.end();
    }
});

app.get('/api/users/:username/get-todolist', function (req, res) {
    logger.info(`received request for user: ${req.params.username}`);
    getUser(req.params.username, (err, user) => {
        if (err) {
            logger.error(err);
            res.statusCode = 404;
            res.end('User Not Found');
        } else {
            getTodoList(user.todoListId, (err, todoList) => {
                if (err) {
                    logger.error(err);
                    res.statusCode = 404;
                    res.end('TodoList Not Found');
                } else {
                    res.statusCode = 200;
                    res.set('Content-Type', 'application/json');
                    res.json(todoList);
                    res.end();
                    logger.info(`sended response for ${req.params.username}`);
                }
            });
        }
    });
});

app.use('/api/todolists/:todoListId*', function (req, res, next) {
    if (
        req.isAuthenticated() &&
        req.user.todoListId === req.params.todoListId
    ) {
        next();
    } else {
        res.statusCode = 403;
        res.statusMessage = 'Unauthorized todolist data request! Access denied';
        res.end();
    }
});

app.post('/api/todolists/:todoListId/add-category', function (req, res) {
    getTodoList(req.params.todoListId, (err, todoList) => {
        if (err) {
            logger.error(err);
            res.statusCode = 404;
            res.end('TodoList Not Found');
        } else {
            addCategory(todoList, req.body);
            res.statusCode = 200;
            res.end();
        }
    });
});

app.post('/api/todolists/:todoListId/delete-category', function (req, res) {
    getTodoList(req.params.todoListId, (err, todoList) => {
        if (err) {
            logger.error(err);
            res.statusCode = 404;
            res.end('TodoList Not Found');
        } else {
            deleteCategory(todoList, req.body);
            res.statusCode = 200;
            res.end();
        }
    });
});

app.post('/api/todolists/:todoListId/rename-category', function (req, res) {
    getTodoList(req.params.todoListId, (err, todoList) => {
        if (err) {
            logger.error(err);
            res.statusCode = 404;
            res.end('TodoList Not Found');
        } else {
            renameCategory(todoList, req.body);
            res.statusCode = 200;
            res.end();
        }
    });
});

app.post('/api/todolists/:todoListId/add-todotask', function (req, res) {
    getTodoList(req.params.todoListId, (err, todoList) => {
        if (err) {
            logger.error(err);
            res.statusCode = 404;
            res.end('TodoList Not Found');
        } else {
            addTodoTask(todoList, req.body);
            res.statusCode = 200;
            res.end();
        }
    });
});

app.post('/api/todolists/:todoListId/edit-todotask', function (req, res) {
    getTodoList(req.params.todoListId, (err, todoList) => {
        if (err) {
            logger.error(err);
            res.statusCode = 404;
            res.end('TodoList Not Found');
        } else {
            editTodoTask(todoList, req.body);

            res.statusCode = 200;
            res.end();
        }
    });
});

app.post('/api/todolists/:todoListId/move-todotask', function (req, res) {
    getTodoList(req.params.todoListId, (err, todoList) => {
        if (err) {
            logger.error(err);
            res.statusCode = 404;
            res.end('TodoList Not Found');
        } else {
            moveTodoTask(todoList, req.body);
            res.statusCode = 200;
            res.end();
        }
    });
});

app.post('/api/todolists/:todoListId/undo', function (req, res) {
    getTodoList(req.params.todoListId, (err, todoList) => {
        if (err) {
            logger.error(err);
            res.statusCode = 404;
            res.end('TodoList Not Found');
        } else {
            undo(todoList, req.body);
            res.statusCode = 200;
            res.end();
        }
    });
});

app.post('/api/todolists/:todoListId/redo', function (req, res) {
    getTodoList(req.params.todoListId, (err, todoList) => {
        if (err) {
            logger.error(err);
            res.statusCode = 404;
            res.end('TodoList Not Found');
        } else {
            redo(todoList, req.body);
            res.statusCode = 200;
            res.end();
        }
    });
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

export default app;
