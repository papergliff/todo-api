const _ = require('lodash')

const { User } = require('../models/user')

// POST /users
const signUp = async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password'])
    const user = new User(body)
    await user.save()
    const token = await user.generateAuthToken()
    res.header('x-auth', token).send(user)
  } catch (e) {
    res.status(400).send(e)
  }
}

// GET /users/me
const getMe = (req, res) => {
  res.send(req.user)
}

// POST /users
const login = async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password'])
    const user = await User.findByCredentials(body.email, body.password)
    const token = await user.generateAuthToken()
    res.header('x-auth', token).send(user) 
  } catch (e) {
    res.status(400).send()
  }
}

// DELETE /users/me/delete
const logout = async (req, res) => {
  try {
    await req.user.removeToken(req.token)
    res.status(200).send()
  } catch (e) {
    res.status(400).send()
  }
}

module.exports = { signUp, getMe, login, logout}
