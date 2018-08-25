const request = require('supertest')
const { ObjectID } = require('mongodb')
const { expect } = require('chai')
const { app } = require('../../server')
const { Todo } = require('../../models/todo')
const { todos, populateTodos, users, populateUsers } = require('../seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('GET /todos', () => {
  it('should fetch all todos', done => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).to.equal(1)
      })
      .end(done)
  })
})

describe('GET /todos/:id', () => {
  it('should return todo doc', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).to.equal(todos[0].text)
      })
      .end(done)
  })

  it('should not return todo doc created by other user', done => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })

  it('should return 404 status if todo is not found', done => {
    const hexId = new ObjectID().toHexString()

    request(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', done => {
    request(app)
      .get('/todos/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })
})

describe('POST /todos', () => {
  it('should create a new todo', done => {
    const text = 'Test todo text'

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect(res => {
        expect(res.body.text).to.equal(text)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.find({text}).then(todos => {
          expect(todos.length).to.equal(1)
          expect(todos[0].text).to.equal(text)
          expect(todos[0].completed).to.be.false
          expect(todos[0].completedAt).to.be.null
          done()
        }).catch(err => done(err))
      }) 
  })

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.find({}).then(todos => {
          expect(todos.length).to.equal(2)
          done()
        }).catch(err => done(err))
      })
  })
})

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    const text = 'New text is on the way'

    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send({text, completed: true})
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).to.equal(text)
        expect(res.body.todo.completed).to.be.true
        expect(res.body.todo.completedAt).to.be.a('number')
      })
      .end(done)
  })
  
  it('should not update the todo created by other user', done => {
    const text = 'New text is on the way'

    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send({text, completed: true})
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done)
  })

  it('should clear completedAt when todo is not completed', done => {
    const text = 'New text is on its way'

    request(app)
      .patch(`/todos/${todos[1]._id.toHexString()}`)
      .send({text, completed: false})
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).to.equal(text)
        expect(res.body.todo.completed).to.be.false
        expect(res.body.todo.completedAt).to.be.null
      })
      .end(done) 
  })
})

describe('DELETE /todos/:id', () => {
  it('should remove a todo', done => {
    let hexId = todos[1]._id.toHexString()

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).to.equal(hexId)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.findById(hexId).then(todo => {
          expect(todo).to.be.null
          done()
        }).catch(e => done(e))
      })
  })
   
  it('should not remove a todo of another user', done => {
    let hexId = todos[0]._id.toHexString()

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.findById(hexId).then(todo => {
          expect(todo).to.exist
          done()
        }).catch(e => done(e))
      })
  })

  it('should return 404 status if todo is not found', done => {
    let hexId = new ObjectID().toHexString()

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', done => {
    request(app)
      .delete('/todos/123abc')
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done)
  })
})