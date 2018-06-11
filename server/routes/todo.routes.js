const router = require('express').Router()

const todoController = require('../controllers/todo.controller')
const { authenticate } = require('../middleware/authenticate')

router.use(authenticate)

router.route('/')
  .get(todoController.listTodos)
  .post(todoController.createTodo)

router.route('/:id')
  .get(todoController.showTodo)
  .patch(todoController.updateTodo)
  .delete(todoController.deleteTodo)

module.exports = router