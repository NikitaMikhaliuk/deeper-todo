const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/userModel');

module.exports = function configureLocalStrategy(passport) {
  passport.use(new LocalStrategy({
    usernameField: 'login',
    passwordField: 'password'
  }, function(username, password, done) {
    
    User.findOne({ username }, function (err, user) {
      if (err) {
        done(err);
      }
      if (!user) {
        done(null, false, { message: 'Incorrect login.' });
      } else {
        user.validPassword(password, done)
      }
    })
  }));
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  return passport;
}