const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('../server')
const { Todo } = require('../models/todo')
const { User } = require('../models/user')
const { todos, populateTodos, users, populateUsers } = require('./seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('POST /todos', () => {
  it('should create a new todo', done => {
    const text = 'Test todo text'

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.find({text}).then(todos => {
          expect(todos.length).toBe(1)
          expect(todos[0].text).toBe(text)
          expect(todos[0].completed).toBe(false)
          expect(todos[0].completedAt).toBe(null)
          done()
        }).catch(err => done(err))
      }) 
  })

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.find({}).then(todos => {
          expect(todos.length).toBe(2)
          done()
        }).catch(err => done(err))
      })
  })
})

describe('GET /todos', () => {
  it('should fetch all todos', done => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2)
      })
      .end(done)
  })
})

describe('GET /todos/:id', () => {
  it('should return todo doc', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done)
  })

  it('should return 404 status if todo is not found', done => {
    const hexId = new ObjectID().toHexString()

    request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', done => {
    request(app)
      .get('/todos/123abc')
      .expect(404)
      .end(done)
  })
})

describe('DELETE /todos/:id', () => {
  it('should remove a todo', done => {
    let hexId = todos[1]._id.toHexString()

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId)
        expect(res.body.todo.text).toBe(todos[1].text)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.findById(hexId).then(todo => {
          expect(todo).toBeNull()
          done()
        }).catch(e => done(e))
      })
  })

  it('should return 404 status if todo is not found', done => {
    let hexId = new ObjectID().toHexString()

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', done => {
    request(app)
      .delete('/todos/123abc')
      .expect(404)
      .end(done)
  })
})

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    const text = 'New text is on the way'

    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send({text, completed: true})
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text)
        expect(res.body.todo.completed).toBe(true)
        expect(typeof res.body.todo.completedAt).toBe('number')
      })
      .end(done)
  })

  it('should clear completedAt when todo is not completed', done => {
    const text = 'New text is on its way'

    request(app)
      .patch(`/todos/${todos[1]._id.toHexString()}`)
      .send({text, completed: false})
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text)
        expect(res.body.todo.completed).toBe(false)
        expect(res.body.todo.completedAt).toBeNull()
      })
      .end(done) 
  })
})

describe('GET /users/me', () => {
  it('should return user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString())
        expect(res.body.email).toBe(users[0].email)
      })
      .end(done)
  })

  it('should return 401 if not authenticated', done => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({})
      })
      .end(done)
  })
})

describe('POST /users', () => {
  it('should create a user', done => {
    const email = 'example@example.com'
    const password = '123mnb!'

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy()
        expect(res.body._id).toBeTruthy()
        expect(res.body.email).toBe(email)
      })
      .end(err => {
        if (err) {
          return done(err)
        }

        User.findOne({email}).then(user => {
          expect(user).toBeTruthy()
          expect(user.password).not.toBe(password)
          done()
        }).catch(e => done(e))
      })
  })

  it('should return validation errors if request invalid', done => {
    request(app)
      .post('/users')
      .send({email: 'invalidEmail.com', password: 'short'})
      .expect(400)
      .end(done)
  })

  it('should not create user if email in use', done => {
    request(app)
      .post('/users')
      .send({email: users[0].email, password: '123idk'})
      .expect(400)
      .end(done)
  })
})

describe('POST /users/login', () => {
  it('should login user and return auth token', done => {
    request(app)
      .post('/users/login')
      .send({email: users[1].email, password: users[1].password})
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy()
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        User.findById(users[1]._id).then(user => {
          expect(user.tokens[0]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          })
          done()
        }).catch(e => done(e))
      })
  })

  it('should reject invalid login', done => {
    request(app)
      .post('/users/login')
      .send({email: users[1].email, password: 'wrongpass'})
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toBeUndefined()
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        User.findById(users[1]._id).then(user => {
          expect(user.tokens.length).toBe(0)
          done()
        }).catch(e => done(e))
      })
  })
})

describe('DELETE /users/me/delete', () => {
  it('should remove auth token on logout', done => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        User.findById(users[0]._id).then(user => {
          expect(user.tokens.length).toBe(0)
          done()
        }).catch(e => done(e))
      })
  })
})