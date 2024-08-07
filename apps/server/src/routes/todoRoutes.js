const express = require("express");
const router = express.Router();

const todoController = require("../controllers/todoController");
const { isLoggedIn } = require("../middleware/auth");

router.get("/", isLoggedIn, todoController.getTodos);
// router.get('/todo/:id', todoController.getTodoById);
router.post("/", isLoggedIn, todoController.createTodo);
router.post("/sync/push", isLoggedIn, todoController.pushTodos);
router.get("/sync/pull", isLoggedIn, todoController.pullTodos);
router.get("/pullStream", isLoggedIn, todoController.pullStream);

module.exports = router;
