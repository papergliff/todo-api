const { ObjectID } = require('mongodb')
const _ = require('lodash')

const { Todo } = require('../models/todo')

const listTodos = (req, res) => {
  Todo.find({
    creator: req.user._id
  }).then(todos => {
    res.send({todos})
  }, e => {
    res.status(400).send(e)
  })
}

const createTodo = (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    creator: req.user._id
  })

  todo.save().then(doc => {
    res.send(doc)
  }, e => {
    res.status(400).send(e)
  })
}

const showTodo = (req, res) => {
  const id = req.params.id

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  Todo.findOne({
    _id: id,
    creator: req.user._id
  }).then(todo => {
    if (!todo) {
      return res.status(404).send()
    }

    res.send({todo})
  }).catch(e => res.status(400).send())
}

const updateTodo = (req, res) => {
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

  Todo.findOneAndUpdate({ _id: id, creator: req.user._id }, { $set: body }, { new: true }).then(todo => {
    if (!todo) {
      return res.status(404).send()
    }

    res.send({todo})
  }).catch(e => res.status(400).send())
}

const deleteTodo = (req, res) => {
  const id = req.params.id

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  Todo.findOneAndRemove({
    _id: id,
    creator: req.user._id
  }).then(todo => {
    if (!todo) {
      return res.status(404).send()
    }

    res.send({todo})
  }).catch(e => res.status(400).send())
}

module.exports = { listTodos, createTodo, showTodo, updateTodo, deleteTodo}