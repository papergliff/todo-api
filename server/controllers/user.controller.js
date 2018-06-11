const _ = require('lodash')

const { User } = require('../models/user')

const signUp = (req, res) => {
  const body = _.pick(req.body, ['email', 'password'])
  const user = new User(body)

  user.save().then(() => {
    return user.generateAuthToken()
  }).then(token => {
    res.header('x-auth', token).send(user)
  }).catch(e => {
    res.status(400).send(e)
  })
}

const getMe = (req, res) => {
  res.send(req.user)
}

const login = (req, res) => {
  const body = _.pick(req.body, ['email', 'password'])
  
  User.findByCredentials(body.email, body.password).then(user => {
    return user.generateAuthToken().then(token => {
      res.header('x-auth', token).send(user)
    })
  }).catch(e => res.status(400).send())
}

const logout = (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send()
  }, () => {
    res.status(400).send()
  })
}

module.exports = { signUp, getMe, login, logout}