const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TodoCategorySchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true
  },
  parentCategoryId: {
    type: String,
    required: true,
    default: ''
  },
  completed: {
    type: Boolean,
    required: true, 
    default: false
  },
  visible: {
    type: Boolean,
    required: true,
    default: true
  },
  linkPath: {
    type: String,
    required: true
  },
  categoriesIds: [String],
  itemsIds: [String],

});
TodoCategorySchema.set('autoIndex', false);

module.exports = TodoCategorySchema;