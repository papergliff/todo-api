const request = require('supertest')
const { ObjectID } = require('mongodb')
const chai = require('chai')
const chaiSubset = require('chai-subset');
const { app } = require('../../server')
const { User } = require('../../models/user')
const { users, populateUsers } = require('../seed/seed')

const { expect } = chai

chai.use(chaiSubset);

beforeEach(populateUsers)

describe('GET /users/me', () => {
  it('should return user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).to.equal(users[0]._id.toHexString())
        expect(res.body.email).to.equal(users[0].email)
      })
      .end(done)
  })

  it('should return 401 if not authenticated', done => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).to.deep.equal({})
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
        expect(res.headers['x-auth']).to.exist
        expect(res.body._id).to.exist
        expect(res.body.email).to.equal(email)
      })
      .end(err => {
        if (err) {
          return done(err)
        }

        User.findOne({email}).then(user => {
          expect(user).to.exist
          expect(user.password).to.not.equal(password)
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
        expect(res.headers['x-auth']).to.exist
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        User.findById(users[1]._id).then(user => {
          expect(user.tokens[1]).to.containSubset({
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
        expect(res.headers['x-auth']).to.be.undefined
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        User.findById(users[1]._id).then(user => {
          expect(user.tokens.length).to.equal(1)
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
          expect(user.tokens.length).to.equal(0)
          done()
        }).catch(e => done(e))
      })
  })
})