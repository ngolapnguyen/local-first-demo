const express = require("express");
const router = express.Router();

const todoController = require("../controllers/todoController");

router.get("/", todoController.getTodos);
// router.get('/todo/:id', todoController.getTodoById);
router.post("/", todoController.createTodo);
router.post("/sync/push", todoController.pushTodos);
router.get("/sync/pull", todoController.pullTodos);
router.get("/pullStream", todoController.pullStream);

module.exports = router;
