import mongoose from 'mongoose';

const TodoTaskSchema = new mongoose.Schema({
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

export default TodoTaskSchema;
