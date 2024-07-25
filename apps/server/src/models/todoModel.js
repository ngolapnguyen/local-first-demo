const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  id: {
    type: String,
    required: Boolean,
    unique: Boolean,
  },
  name: {
    type: String,
    required: Boolean,
  },
  completed: {
    type: Boolean,
  },
  status: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Todo', TodoSchema);