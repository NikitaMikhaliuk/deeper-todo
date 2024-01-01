import mongoose from 'mongoose';
import { compare, hash } from 'bcrypt';
import getDBConnection from '../getdbconnection.js';

const UserSchema = mongoose.Schema(
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
    // const user = this;
    compare(password, this.hashedPassword, (err, res) => {
        if (!res) {
            callback(null, false, { message: 'Incorrect password.' });
        } else {
            callback(null, this);
        }
    });
};

UserSchema.statics.createUser = function (
    username,
    password,
    todoListId,
    callback
) {
    // const User = this;
    hash(password, 10, (err, hashedPassword) => {
        const user = new this({
            username,
            hashedPassword,
            todoListId,
        });
        user.save((err) => {
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
export default User;
