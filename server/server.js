require('./config/config')

const express = require('express')
const bodyParser = require('body-parser')

const { mongoose } = require('./db/mongoose')

const app = express()
const port = process.env.PORT

const todoRoutes = require('./routes/todo.routes')
const userRoutes = require('./routes/user.routes')

app.use(bodyParser.json())
app.use('/todos', todoRoutes)
app.use('/users', userRoutes)

app.listen(port, () => {
  console.log(`Started up at port ${port}`)
})

module.exports = { app }