const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const getDBConnection = require('../getdbconnection');
const UserSchema = Schema(
    {
        username: {
            type: String,
            required: true,
        },
        hashedPassword: {
            type: String,
            required: true,
        },
        todoListId: {
            type: String,
            required: true,
            default: '',
        },
    },
    { minimize: false }
);

UserSchema.methods.validPassword = function (password, callback) {
    const user = this;
    bcrypt.compare(password, user.hashedPassword, function (err, res) {
        if (!res) {
            callback(null, false, { message: 'Incorrect password.' });
        } else {
            callback(null, user);
        }
    });
};

UserSchema.statics.createUser = function (
    username,
    password,
    todoListId,
    callback
) {
    const User = this;
    bcrypt.hash(password, 10, function hashPassword(err, hashedPassword) {
        const user = new User({
            username,
            hashedPassword,
            todoListId,
        });
        user.save(function (err) {
            if (err) {
                console.log(err);
                return;
            } else {
                callback();
            }
        });
    });
};
UserSchema.set('autoIndex', false);
const User = getDBConnection('User', UserSchema);
module.exports = User;
