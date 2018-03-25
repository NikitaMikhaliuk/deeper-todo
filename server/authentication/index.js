const passport = require('passport');
const configureLocal = require('./configure-local');
module.exports = configureLocal(passport);