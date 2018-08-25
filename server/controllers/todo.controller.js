const { ObjectID } = require('mongodb')
const _ = require('lodash')

const { Todo } = require('../models/todo')

// GET /todos
const listTodos = async (req, res) => {
  try {
    const todos = await Todo.find({
      creator: req.user._id
    })
    res.send({todos})
  } catch (e) {
    res.status(400).send(e)
  }
}

// POST /todos
const createTodo = async (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    creator: req.user._id
  })

  try {
    const doc = await todo.save()
    res.send(doc)
  } catch (e) {
    res.status(400).send(e)
  }
}

// GET /todos/:id
const showTodo = async (req, res) => {
  const id = req.params.id

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  try {
    const todo = await Todo.findOne({
      _id: id,
      creator: req.user._id
    })
    if (!todo) {
      return res.status(404).send()
    }
    
    res.send({todo})
  } catch (e) {
    res.status(400).send()
  }
}

// PATCH /todos/:id
const updateTodo = async (req, res) => {
  const id = req.params.id
  const body = _.pick(req.body, ['text', 'completed'])

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime()
  } else {
    body.completed = false
    body.completedAt = null
  }

  try {
    const todo = await Todo.findOneAndUpdate({ _id: id, creator: req.user._id }, { $set: body }, { new: true })
    if (!todo) {
      return res.status(404).send()
    }

    res.send({todo})
  } catch (e) {
    res.status(400).send()
  }
}

// DELETE /todos/:id
const deleteTodo = async (req, res) => {
  const id = req.params.id
  
  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }
  
  try {
    const todo = await Todo.findOneAndRemove({
      _id: id,
      creator: req.user._id
    })

    if (!todo) {
      return res.status(404).send()
    }
  
    res.send({todo})
  } catch (e) {
    res.status(400).send()
  }
}

module.exports = { listTodos, createTodo, showTodo, updateTodo, deleteTodo}
