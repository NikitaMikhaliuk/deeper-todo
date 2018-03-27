const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('./authentication');
const processRequests = require('./requestProcessor');
const logger = require('./logger');
const path = require('path');
const favicon = require('serve-favicon');
var app = express();
var port = 3000

app.use(favicon(path.join(__dirname, '../', '/dist/favicon.ico')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({ 
  secret: 'SECRET',
  resave: false,
  saveUninitialized: true,
 })); 
app.use(passport.initialize());
app.use(passport.session());

function login(req, res, next) {
  logger.info('login request');
  if (!req.body.login.match(/\w{5,}/) || !req.body.password.match(/(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/)) { 
    res.statusCode = 401;
    res.statusMessage = 'Incorrect Login or Password';
    res.end()
  } else {
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        res.statusCode = 502;
        res.end('Sorry, unable to login') 
      }
      if (!user) { 
        res.statusCode = 401; 
        res.statusMessage = 'Incorrect Login or Password';
        res.end();
      } else {
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          res.json( {redirect: '/app/' + user.username});
          res.end();
        });
      }      
    })(req, res, next);
  }  
}

app.post('/login', login);

app.post('/register', function(req, res, next) {
  if (!req.body.login.match(/\w{5,}/) || !req.body.password.match(/(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/)) {
    res.statusCode = 401;
    res.end('Incorrect Login or Password');
  } else {    
    processRequests.getUser(req.body.login, (err, user) => {
      if (user) {
        res.statusCode = 401;
        res.statusMessage = 'User is alredy exists';
        res.end();
      } else {
        processRequests.createUser(req.body.login, req.body.password, () => {
          login(req, res, next);
        });
      }
    });
  }  
});

app.get('/app/:username*', function(req, res) {
  if (req.isAuthenticated() && req.user.username === req.params.username) {
    res.sendFile(path.join(__dirname, '../','/dist/index.html'))
  } else {
    res.redirect('/');
  }
})

app.get('/', function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/app/' + req.user.username)
  } else {
    res.sendFile(path.join(__dirname, '../','/dist/authentication.html'))
  }
});

app.use('/api/users/:username*', function(req, res, next) {
  if (req.isAuthenticated() && req.user.username === req.params.username) {
    next();
  } else {
    res.statusCode = 403;
    res.statusMessage = 'Unauthorized user data request! Access denied';
    res.end();
  }
})

app.get('/api/users/:username/get-todolist', function(req, res) {
  logger.info(`received request for user: ${req.params.username}`);
  processRequests.getUser(req.params.username, (err, user) => {
    if (err) {
      logger.error(err);
      res.statusCode = 404;
      res.end('User Not Found')
    } else {
      processRequests.getTodoList(user.todoListId, (err, todoList) => {
        if (err) {
          logger.error(err);
          res.statusCode = 404;
          res.end('TodoList Not Found')
        } else {
          res.statusCode = 200;
          res.set('Content-Type', 'application/json');
          res.json(todoList);
          res.end();
          logger.info(`sended response for ${req.params.username}`)
        }
      })      
    }
  }) 
});

app.use('/api/todolists/:todoListId*', function(req, res, next) {
  if (req.isAuthenticated() && req.user.todoListId === req.params.todoListId) {
    next();
  } else {
    res.statusCode = 403;
    res.statusMessage = 'Unauthorized todolist data request! Access denied';
    res.end();
  }
})


app.post('/api/todolists/:todoListId/add-category', function(req, res) {
  processRequests.getTodoList(req.params.todoListId, (err, todoList) => {
    if (err) {
      logger.error(err);
      res.statusCode = 404;
      res.end('TodoList Not Found')
    } else {
      processRequests.addCategory(todoList, req.body)
      res.statusCode = 200;
      res.end()
    }
  })
})

app.post('/api/todolists/:todoListId/delete-category', function(req, res) {
  processRequests.getTodoList(req.params.todoListId, (err, todoList) => {
    if (err) {
      logger.error(err);
      res.statusCode = 404;
      res.end('TodoList Not Found')
    } else {      
      processRequests.deleteCategory(todoList, req.body);     
      res.statusCode = 200;
      res.end();
    }
  })
})

app.post('/api/todolists/:todoListId/rename-category', function(req, res) {
  processRequests.getTodoList(req.params.todoListId, (err, todoList) => {
    if (err) {
      logger.error(err);
      res.statusCode = 404;
      res.end('TodoList Not Found')
    } else {
      processRequests.renameCategory(todoList, req.body)
      res.statusCode = 200;
      res.end()
    }
  })
})

app.post('/api/todolists/:todoListId/add-todotask', function(req, res) {
  processRequests.getTodoList(req.params.todoListId, (err, todoList) => {
    if (err) {
      logger.error(err);
      res.statusCode = 404;
      res.end('TodoList Not Found')
    } else {
      processRequests.addTodoTask(todoList, req.body)
      res.statusCode = 200;
      res.end()
    }
  })
})

app.post('/api/todolists/:todoListId/edit-todotask', function(req, res) {
  processRequests.getTodoList(req.params.todoListId, (err, todoList) => {
    if (err) {
      logger.error(err);
      res.statusCode = 404;
      res.end('TodoList Not Found')
    } else {
      processRequests.editTodoTask(todoList, req.body);
      
      res.statusCode = 200;
      res.end()
    }
  })
})

app.post('/api/todolists/:todoListId/move-todotask', function(req, res) {
  processRequests.getTodoList(req.params.todoListId, (err, todoList) => {
    if (err) {
      logger.error(err);
      res.statusCode = 404;
      res.end('TodoList Not Found')
    } else {
      processRequests.moveTodoTask(todoList, req.body);
      res.statusCode = 200;
      res.end()
    }
  })
})

app.post('/api/todolists/:todoListId/undo', function(req, res) {
  processRequests.getTodoList(req.params.todoListId, (err, todoList) => {
    if (err) {
      logger.error(err);
      res.statusCode = 404;
      res.end('TodoList Not Found')
    } else {
      processRequests.undo(todoList, req.body);
      res.statusCode = 200;
      res.end()
    }
  })
})

app.post('/api/todolists/:todoListId/redo', function(req, res) {
  processRequests.getTodoList(req.params.todoListId, (err, todoList) => {
    if (err) {
      logger.error(err);
      res.statusCode = 404;
      res.end('TodoList Not Found')
    } else {
      processRequests.redo(todoList, req.body);
      res.statusCode = 200;
      res.end()
    }
  })
})

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = app;

