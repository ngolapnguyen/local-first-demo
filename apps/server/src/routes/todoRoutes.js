const express = require('express');
const router = express.Router();

const todoController = require('../controllers/todoController');

router.get('/', todoController.getTodos);
// router.get('/todo/:id', todoController.getTodoById);
router.post('/', todoController.createTodo);
router.post('/sync', todoController.syncTodos);
router.post('/syncDeleted', todoController.syncDeletedTodos);
// router.put('/todo/:id', todoController.updateTodo);
// router.delete('/todo/:id', todoController.deleteTodo);

module.exports = router;