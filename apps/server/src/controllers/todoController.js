const Todo = require('../models/todoModel');

// Get all todos
exports.getTodos = async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// // Get a single todo by ID
// exports.getTodo = async (req, res) => {
//   try {
//     const todo = await Todo.findById(req.params.id);
//     if (!todo) return res.status(404).json({ message: 'Todo not found' });
//     res.json(todo);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Create a new todo
exports.createTodo = async (req, res) => {
  console.log(req.body, 121212);
  try {
    const newTodo = new Todo({
      id: req.body.id,
      name: req.body.name,
      status: req.body.status || 'not-started',
    });
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// // Update a todo by ID
// exports.updateTodo = async (req, res) => {
//   try {
//     const updatedTodo = await Todo.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     if (!updatedTodo) return res.status(404).json({ message: 'Todo not found' });
//     res.json(updatedTodo);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Delete a todo by ID
// exports.deleteTodo = async (req, res) => {
//   try {
//     const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
//     if (!deletedTodo) return res.status(404).json({ message: 'Todo not found' });
//     res.json({ message: 'Todo deleted' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.syncTodos = async (req, res) => {
  const { newTodos, updatedTodos } = req.body;
  try {
    for (const todo of newTodos) {
      await Todo.create(todo);
    }
    for (const todo of updatedTodos) {
      await Todo.updateOne({ id: todo.id }, todo);
    }
    res.status(200).json({ success: true, message: 'Sync successful' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Sync failed', details: error.message });
  }
};

exports.syncDeletedTodos = async (req, res) => {
  const { deletedTodos } = req.body;
  try {
    for (const todo of deletedTodos) {
      await Todo.deleteOne({ id: todo.id });
    }
    res.status(200).json({ success: true, message: 'Deleted sync successful' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Deleted sync failed', details: error.message });
  }
};