const mongoose = require("mongoose");

// Define the schema
const TodoSchema = new mongoose.Schema(
  {
    _id: String, // Map your custom id field to _id
    name: { type: String, required: true },
    completed: { type: Boolean, default: false },
    updatedAt: { type: Number, required: true },
  },
  { _id: false }
); // Disable automatic _id generation

module.exports = mongoose.model("Todo", TodoSchema);
