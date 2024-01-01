const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TodoTaskSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    parentCategoryId: {
        type: String,
        required: true,
        default: '',
    },
    completed: {
        type: Boolean,
        required: true,
        default: false,
    },
    description: {
        type: String,
        default: '',
    },
});
TodoTaskSchema.set('autoIndex', false);

module.exports = TodoTaskSchema;
